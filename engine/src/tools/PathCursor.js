/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

Wick.Tools.PathCursor = class extends Wick.Tool {
    constructor () {
        super();

        this.name = 'pathcursor';

        this.SELECTION_TOLERANCE = 3;
        this.CURSOR_DEFAULT = 'cursors/default.png';
        this.CURSOR_SEGMENT = 'cursors/segment.png';
        this.CURSOR_CURVE = 'cursors/curve.png';
        this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR = 'rgba(100,150,255,1.0)';
        this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH = 1.5;
        this.HOVER_PREVIEW_SEGMENT_FILL_COLOR = '#ffffff';
        this.HOVER_PREVIEW_SEGMENT_RADIUS = 5;
        this.HOVER_PREVIEW_CURVE_STROKE_WIDTH = 2;
        this.HOVER_PREVIEW_CURVE_STROKE_COLOR = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;

        this.hitResult = new this.paper.HitResult();

        this.draggingCurve = new this.paper.Curve();
        this.draggingSegment = new this.paper.Segment();
        this.hoverPreview = new this.paper.Item({insert:false});
        this.detailedEditing = null;

        // Segments currently marked as "selected" in paper.js so the
        // active node being interacted with is visually highlighted
        // (filled anchor point instead of hollow). Tracked so we can clear
        // the flag off old segments when the interaction moves to a new one.
        this.selectedSegments = [];

        // Self-drawn indicator (a small filled circle) marking the active
        // handle end being dragged. Not a native paper.js selection flag -
        // see _showActiveHandleIndicator for why.
        this.activeHandleIndicator = new this.paper.Item({insert:false});

        this.currentCursorIcon = '';
    }

    get doubleClickEnabled () {
        return true;
    }

    get cursor () {
        return 'url("'+this.currentCursorIcon+'") 32 32, auto';
    }

    onActivate (e) {
    }

    onDeactivate (e) {
        this._leaveDetailedEditing();
    }

    onMouseMove (e) {
        super.onMouseMove(e);

        // Remove the hover preview, a new one will be generated if needed
        this.hoverPreview.remove();

        // Find the thing that is currently under the cursor.
        this.hitResult = this._updateHitResult(e);

        // Update the image being used for the cursor
        this._setCursor(this._getCursor());

        // Regen hover preview
        if(this.hitResult.type === 'segment' && !this.hitResult.item.data.isSelectionBoxGUI) {
            // Hovering over a segment, draw a circle where the segment is.
            // segment.point is in the item's local space - convert to
            // global canvas coordinates before placing our own GUI circle.
            var globalSegmentPoint = this.hitResult.item.localToGlobal(this.hitResult.segment.point);
            this.hoverPreview = new this.paper.Path.Circle(globalSegmentPoint, this.HOVER_PREVIEW_SEGMENT_RADIUS/this.paper.view.zoom);
            this.hoverPreview.strokeColor = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;
            this.hoverPreview.strokeWidth = this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH;
            this.hoverPreview.fillColor = this.HOVER_PREVIEW_SEGMENT_FILL_COLOR;
        } else if (this.hitResult.type === 'curve' && !this.hitResult.item.data.isSelectionBoxGUI) {
            // Hovering over a curve, render a copy of the curve that can be
            // bent. The curve's points/handles are in the item's local
            // space - convert everything to global canvas coordinates
            // first, or this preview ends up wildly offset/scaled for any
            // item that isn't a simple 1:1, untransformed path (e.g. paths
            // nested inside a Clip with its own position/scale).
            var curveItem = this.hitResult.item;
            var curve = this.hitResult.location.curve;
            var globalPoint1 = curveItem.localToGlobal(curve.point1);
            var globalPoint2 = curveItem.localToGlobal(curve.point2);
            var globalHandle1 = this._localVectorToGlobal(curveItem, curve.point1, curve.handle1);
            var globalHandle2 = this._localVectorToGlobal(curveItem, curve.point2, curve.handle2);

            this.hoverPreview = new this.paper.Path();
            this.hoverPreview.strokeWidth = this.HOVER_PREVIEW_CURVE_STROKE_WIDTH;
            this.hoverPreview.strokeColor = this.HOVER_PREVIEW_CURVE_STROKE_COLOR;
            this.hoverPreview.add(globalPoint1);
            this.hoverPreview.add(globalPoint2);
            this.hoverPreview.segments[0].handleOut = globalHandle1;
            this.hoverPreview.segments[1].handleIn = globalHandle2;
        }
        this.hoverPreview.data.wickType = 'gui';
    }

    onMouseDown (e) {
        super.onMouseDown(e);

        if(!e.modifiers) e.modifiers = {};

        this.hitResult = this._updateHitResult(e);

        if (this.detailedEditing !== null && !(
            this.hitResult.item || (
                this.hitResult.type && this.hitResult.type.startsWith('handle')))) {
            // Clicked neither on the currently edited path nor on a handle.
            this._leaveDetailedEditing();
        }

        // Reset any previous active-node/handle highlight; re-applied
        // below if this click actually landed on something selectable.
        this._clearSegmentSelection();
        this._hideActiveHandleIndicator();

        if (this.hitResult.item && this.hitResult.type === 'curve') {
            // Clicked a curve, start dragging it
            this.draggingCurve = this.hitResult.location.curve;

            // Highlight both endpoints of the curve being bent.
            this._selectSegment(this.draggingCurve.segment1);
            this._selectSegment(this.draggingCurve.segment2);
        } else if (this.hitResult.item && this.hitResult.type === 'segment') {
            // Highlight the node being clicked/dragged.
            this._selectSegment(this.hitResult.segment);

            if(e.modifiers.alt || 
                e.modifiers.command ||
                e.modifiers.control ||
                e.modifiers.option ||
                e.modifiers.shift) {
                this.hitResult.segment.remove();
            }
        } else if (this.hitResult.type && this.hitResult.type.startsWith('handle')) {
            // Highlight the segment that owns the handle being dragged, and
            // draw a small marker at the handle end itself so it shows as
            // active (handle selection isn't tracked via _selectSegment -
            // see _showActiveHandleIndicator).
            this._selectSegment(this.hitResult.segment);
            var isHandleIn = this.hitResult.type === 'handle-in';
            var activeHandle = isHandleIn ? this.hitResult.segment.handleIn : this.hitResult.segment.handleOut;
            // segment.point/handleIn/handleOut are in the item's LOCAL
            // coordinate space, not the canvas's global space - convert
            // before placing our indicator, which is a separate item
            // inserted directly into the canvas.
            var localHandleEnd = this.hitResult.segment.point.add(activeHandle);
            var globalHandleEnd = this.hitResult.item.localToGlobal(localHandleEnd);
            this._showActiveHandleIndicator(globalHandleEnd);
        }
    }

    onDoubleClick (e) {
        this.hitResult = this._updateHitResult(e);

        if (this.detailedEditing == null) {
            // If detailed editing is off, turn it on for this path.
            //
            // IMPORTANT: this.hitResult here comes from _updateHitResult()
            // called above, which - since this.detailedEditing was still
            // null at that point - ran the "bubble up to the top-level
            // ancestor" logic (a single click can only ever select a whole
            // group/Clip, never one of its children). For paths nested
            // inside a group (virtually all SVG-imported paths, since every
            // <g> becomes a Wick.Clip), that means this.hitResult.item is
            // the outer group, NOT the path the user actually double-clicked
            // on. Re-run the hit test in "deep" mode so detailedEditing
            // locks onto the real leaf path - otherwise every later
            // segment/curve hit (which correctly resolves to the leaf path)
            // fails the UUID match against the wrongly-recorded outer group,
            // and dragging silently does nothing while paper.js still
            // renders every child path's segment markers (because
            // setFullySelected cascades down a group).
            var deepHitResult = this._updateHitResult(e, true);
            this.hitResult = deepHitResult.item ? deepHitResult : this.hitResult;

            this.detailedEditing = this.hitResult.item;
            this.detailedEditing.setFullySelected(true);

        } else if (!this.hitResult.item) {
            // If detailed editing is on for some path, but the user
            // double clicked somewhere else, turn it off.
            this._leaveDetailedEditing();

        } else if (this.hitResult.item && this.hitResult.type === 'curve') {
            
            var location = this.hitResult.location;
            var path = this.hitResult.item;

            var addedPoint = path.insert(location.index + 1, e.point);

            if (!e.modifiers.shift) {
                addedPoint.smooth()

                var handleInMag = Math.sqrt(
                    addedPoint.handleIn.x*addedPoint.handleIn.x+
                    addedPoint.handleIn.y+addedPoint.handleIn.y)
                var handleOutMag = Math.sqrt(
                    addedPoint.handleOut.x*addedPoint.handleOut.x+
                    addedPoint.handleOut.y+addedPoint.handleOut.y)

                if(handleInMag > handleOutMag) {
                    var avgMag = handleOutMag;
                    addedPoint.handleIn.x = -addedPoint.handleOut.x*1.5;
                    addedPoint.handleIn.y = -addedPoint.handleOut.y*1.5;
                    addedPoint.handleOut.x *= 1.5;
                    addedPoint.handleOut.y *= 1.5;
                } else {
                    var avgMag = handleInMag;
                    addedPoint.handleOut.x = -addedPoint.handleIn.x*1.5;
                    addedPoint.handleOut.y = -addedPoint.handleIn.y*1.5;
                    addedPoint.handleIn.x *= 1.5;
                    addedPoint.handleIn.y *= 1.5;
                }
            }

            if (this.detailedEditing !== null) {
                path.setFullySelected(true);
            }

        } else if (this.hitResult.item && this.hitResult.type === 'segment') {
            var hix = this.hitResult.segment.handleIn.x;
            var hiy = this.hitResult.segment.handleIn.y;
            var hox = this.hitResult.segment.handleOut.x;
            var hoy = this.hitResult.segment.handleOut.y;
            if(hix === 0 && hiy === 0 && hix === 0 && hiy === 0) {
                this.hitResult.segment.smooth();
            } else {
                this.hitResult.segment.handleIn.x = 0;
                this.hitResult.segment.handleIn.y = 0;
                this.hitResult.segment.handleOut.x = 0;
                this.hitResult.segment.handleOut.y = 0;
            }
        }

    }

    onMouseDrag (e) {
        if(!e.modifiers) e.modifiers = {};

        if(this.hitResult.item && this.hitResult.type === 'segment') {
            // We're dragging an individual point, so move the point.
            this.hitResult.segment.point = this.hitResult.segment.point.add(e.delta);
            // hoverPreview is a separate GUI item living in global canvas
            // space - convert the (local) segment point before using it as
            // a position, same as everywhere else in this file.
            this.hoverPreview.position = this.hitResult.item.localToGlobal(this.hitResult.segment.point);
        } else if(this.hitResult.item && this.hitResult.type === 'curve') {
            // We're dragging a curve, so bend the curve.
            var segment1 = this.draggingCurve.segment1;
            var segment2 = this.draggingCurve.segment2;
            var handleIn = segment1.handleOut;
            var handleOut = segment2.handleIn;

            if(handleIn.x === 0 && handleIn.y === 0) {
                handleIn.x = (segment2.point.x - segment1.point.x) / 4;
                handleIn.y = (segment2.point.y - segment1.point.y) / 4;
            }
            if(handleOut.x === 0 && handleOut.y === 0) {
                handleOut.x = (segment1.point.x - segment2.point.x) / 4;
                handleOut.y = (segment1.point.y - segment2.point.y) / 4;
            }

            handleIn.x += e.delta.x;
            handleIn.y += e.delta.y;
            handleOut.x += e.delta.x;
            handleOut.y += e.delta.y;

            // Update the hover preview to match the curve we just changed.
            // draggingCurve.handle1/handle2 are local vectors - convert to
            // global before assigning them to our GUI preview item, same
            // as when the preview was first created in onMouseMove.
            this.hoverPreview.segments[0].handleOut = this._localVectorToGlobal(this.hitResult.item, segment1.point, this.draggingCurve.handle1);
            this.hoverPreview.segments[1].handleIn = this._localVectorToGlobal(this.hitResult.item, segment2.point, this.draggingCurve.handle2);
        }

        if (this.hitResult.type && this.hitResult.type.startsWith('handle')) {
            var otherHandle;
            var handle;
            if(this.hitResult.type === 'handle-in') {
                handle = this.hitResult.segment.handleIn;
                otherHandle = this.hitResult.segment.handleOut;
            } else if (this.hitResult.type === 'handle-out') {
                handle = this.hitResult.segment.handleOut;
                otherHandle = this.hitResult.segment.handleIn;
            }

            handle.x += e.delta.x;
            handle.y += e.delta.y;
            if (!e.modifiers.shift) {
                otherHandle.x -= e.delta.x;
                otherHandle.y -= e.delta.y;
            }

            // Keep the active-handle marker glued to the handle end as it
            // moves. Convert from the item's local space to global canvas
            // coordinates, same as when the indicator was first created.
            var localPoint = this.hitResult.segment.point.add(handle);
            this.activeHandleIndicator.position = this.hitResult.item.localToGlobal(localPoint);
        }
    }

    onMouseUp (e) {
        if (this.hitResult.type === 'segment' || this.hitResult.type === 'curve') {
            this.fireEvent({eventName: 'canvasModified', actionName:'pathcursor'});
        }
    }

    onKeyDown(e) {
        if (this.detailedEditing !== null && e.key == "<") {
            var wick = Wick.ObjectCache.getObjectByUUID(
                this._getWickUUID(this.detailedEditing));
            var path = wick._view._item;
            path.closed = !path.closed;
            this.fireEvent('canvasModified');
        }
    }

    _updateHitResult (e, deep) {
        var newHitResult = this.paper.project.hitTest(e.point, {
            fill: true,
            stroke: true,
            curves: true,
            segments: true,
            handles: this.detailedEditing !== null,
            tolerance: this.SELECTION_TOLERANCE,
            match: (result => {
                return result.item !== this.hoverPreview
                    && !result.item.data.isBorder;
            }),
        });
        if(!newHitResult) newHitResult = new this.paper.HitResult();

        if (deep) {
            // Caller explicitly wants the real leaf item under the cursor,
            // skipping the "bubble up to the top-level ancestor"
            // group-selection rule below. Used when first entering detailed
            // editing on double-click, so we lock onto the actual path the
            // user clicked, not its outermost container group/Clip.
            return newHitResult;
        }

        if (this.detailedEditing !== null) {
            if (this._getWickUUID(newHitResult.item) !== this._getWickUUID(this.detailedEditing)) {
                // Hits an item, but not the one currently in detail edit - handle as a click with no hit.
                return new this.paper.HitResult();
            }

            // We're already in detailed editing for this exact item (UUID
            // matched above). Return the hit as-is and skip the "bubble up
            // to the top-level ancestor" logic below entirely.
            //
            // That logic exists so a normal click can only ever select a
            // whole group/Clip, never one of its inner children - but it
            // was also running here, AFTER we'd already confirmed this hit
            // belongs to the exact path being detail-edited. Since paths
            // imported from SVG are almost always nested inside one or more
            // auto-generated Clip groups (SVGAsset.walkItems turns every
            // <g> into a Wick.Clip), item.parent.parent was true for them,
            // so every segment/curve hit got silently rewritten to a 'fill'
            // hit on the outer-most ancestor. The node/handle dots still
            // rendered fine (paper.js draws them straight from
            // fullySelected, independent of hit-testing), but
            // onMouseDown/onMouseDrag only react to 'segment'/'curve'/
            // 'handle-*' hit types, so dragging them silently did nothing -
            // exactly the "nodes appear but are inactive" symptom.
            return newHitResult;
        }

        if(newHitResult.item && !newHitResult.item.data.isSelectionBoxGUI) {
            // You can't select children of compound paths, you can only select the whole thing.
            if (newHitResult.item.parent.className === 'CompoundPath') {
                newHitResult.item = newHitResult.item.parent;
            }

            // You can't select individual children in a group, you can only select the whole thing.
            if (newHitResult.item.parent.parent) {
                newHitResult.type = 'fill';

                while (newHitResult.item.parent.parent) {
                    newHitResult.item = newHitResult.item.parent;
                }
            }

            // this.paper.js has two names for strokes+curves, we don't need that extra info
            if(newHitResult.type === 'stroke') {
                newHitResult.type = 'curve';
            }

            // Mousing over rasters acts the same as mousing over fills.
            if(newHitResult.type === 'pixel') {
                newHitResult.type = 'fill';
            }
        }

        return newHitResult;
    }

    _getCursor () {
        if(!this.hitResult.item) {
            return this.CURSOR_DEFAULT;
        } else if (this.hitResult.type === 'curve') {
            return this.CURSOR_CURVE;
        } else if (this.hitResult.type === 'segment') {
            return this.CURSOR_SEGMENT;
        }
    }

    _setCursor (cursor) {
        this.currentCursorIcon = cursor;
    }

    _leaveDetailedEditing () {
        if (this.detailedEditing !== null) {
            this.paper.project.deselectAll();

            this.paper.project.activeLayer.children.forEach(function (child) {
                if (child.wick && !child.wick.isSymbol) {
                    child.fullySelected = false;
                }
            });

            this._clearSegmentSelection();
            this._hideActiveHandleIndicator();

            this.detailedEditing = null;

            this.fireEvent('canvasModified');
        }
    }

    _getWickUUID (item) {
        if (item) {
            return item.data.wickUUID;
        } else {
            return undefined;
        }
    }

    /**
     * Converts a handle/direction VECTOR (a relative offset, like
     * segment.handleIn/handleOut, or a Curve's handle1/handle2) from an
     * item's local coordinate space into global canvas space.
     *
     * This is NOT the same as calling item.localToGlobal() directly on the
     * vector - that would also apply the item's translation, which is
     * wrong for a relative offset (it would shift the vector's direction
     * based on where the item happens to sit on the canvas). Instead we
     * transform the point-plus-vector and the point separately, then take
     * the difference - this correctly applies the item's rotation/scale to
     * the vector while cancelling out translation.
     *
     * @param {paper.Item} item
     * @param {paper.Point} localPoint - the anchor point the vector is relative to (local space).
     * @param {paper.Point} localVector - the relative offset to convert (local space).
     * @returns {paper.Point} the equivalent vector in global space.
     */
    _localVectorToGlobal (item, localPoint, localVector) {
        var globalPoint = item.localToGlobal(localPoint);
        var globalPointPlusVector = item.localToGlobal(localPoint.add(localVector));
        return globalPointPlusVector.subtract(globalPoint);
    }

    /**
     * Marks a segment as "selected" in paper.js so its anchor point renders
     * as active (filled instead of hollow), and remembers it so it can be
     * cleared later.
     * @param {paper.Segment} segment
     */
    _selectSegment (segment) {
        if (!segment) return;
        segment.selected = true;
        this.selectedSegments.push(segment);
    }

    /**
     * Clears the "selected" highlight off any segments previously marked
     * active via _selectSegment.
     */
    _clearSegmentSelection () {
        this.selectedSegments.forEach(segment => {
            // The segment (or its path) may have been removed/changed in
            // the meantime (e.g. alt-click delete) - guard against errors.
            try {
                segment.selected = false;
            } catch (err) {
                // Segment no longer valid, ignore.
            }
        });
        this.selectedSegments = [];
    }

    /**
     * Draws a small filled circle at the given point to mark the handle end
     * currently being dragged as "active". This is a self-drawn GUI item
     * (like hoverPreview) rather than a native paper.js selection flag,
     * since toggling segment.handleIn/handleOut.selected turned out to
     * corrupt this fork's internal path selection state.
     * @param {paper.Point} point - absolute position of the handle end.
     */
    _showActiveHandleIndicator (point) {
        this._hideActiveHandleIndicator();
        this.activeHandleIndicator = new this.paper.Path.Circle(point, this.HOVER_PREVIEW_SEGMENT_RADIUS/this.paper.view.zoom);
        this.activeHandleIndicator.strokeColor = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;
        this.activeHandleIndicator.strokeWidth = this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH;
        this.activeHandleIndicator.fillColor = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;
        this.activeHandleIndicator.data.wickType = 'gui';
    }

    /**
     * Removes the active-handle indicator drawn by _showActiveHandleIndicator.
     */
    _hideActiveHandleIndicator () {
        this.activeHandleIndicator.remove();
    }
}
