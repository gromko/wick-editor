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

class SelectionWidget {
    /**
     * Creates a SelectionWidget
     */
    constructor (args) {
        if(!args) args = {};
        if(!args.layer) args.layer = paper.project.activeLayer;

        this._layer = args.layer;
        this._item = new paper.Group({ insert:false });
    }

    /**
     * The item containing the widget GUI
     */
    get item () {
        return this._item;
    }

    /**
     * The layer to add the widget GUI item to.
     */
    get layer () {
        return this._layer;
    }

    set layer (layer) {
        this._layer = layer;
    }

    /**
     * The rotation of the selection box GUI.
     */
    get boxRotation () {
        return this._boxRotation;
    }

    set boxRotation (boxRotation) {
        this._boxRotation = boxRotation;
    }

    /**
     * The items currently inside the selection widget
     */
    get itemsInSelection () {
        return this._itemsInSelection;
    }

    /**
     * The point to rotate/scale the widget around.
     */
    get pivot () {
        return this._pivot;
    }

    set pivot (pivot) {
        this._pivot = pivot;
    }

    /**
     * The position of the top left corner of the selection box.
     */
    get position () {
        return this._boundingBox.topLeft.rotate(this.rotation, this.pivot);
    }

    set position (position) {
        var d = position.subtract(this.position);
        this.translateSelection(d);
    }

    /**
     * The width of the selection.
     */
    get width () {
        return this._boundingBox.width;
    }

    set width (width) {
        var d = width / this.width;
        if(d === 0) d = 0.001;
        this.scaleSelection(new paper.Point(d, 1.0));
    }

    /**
     * The height of the selection.
     */
    get height () {
        return this._boundingBox.height;
    }

    set height (height) {
        var d = height / this.height;
        this.scaleSelection(new paper.Point(1.0, d));
    }

    /**
     * The rotation of the selection.
     */
    get rotation () {
        return this._boxRotation;
    }

    set rotation (rotation) {
        var d = rotation - this.rotation;
        this.rotateSelection(d);
    }

    /**
     * Flip the selected items horizontally.
     */
    flipHorizontally () {
        this.scaleSelection(new paper.Point(-1.0, 1.0));
    }

    /**
     * Flip the selected items vertically.
     */
    flipVertically () {
        this.scaleSelection(new paper.Point(1.0, -1.0));
    }

    /**
     * The bounding box of the widget.
     */
    get boundingBox () {
        return this._boundingBox
    }

    /**
     * The current transformation being done to the selection widget.
     * @type {string}
     */
    get currentTransformation () {
        return this._currentTransformation;
    }

    set currentTransformation (currentTransformation) {
        if(['translate', 'scale', 'rotate', 'skew'].indexOf(currentTransformation) === -1) {
            console.error('Paper.SelectionWidget: Invalid transformation type: ' + currentTransformation);
            currentTransformation = null;
        } else {
            this._currentTransformation = currentTransformation;
        }
    }

    /**
     * Build a new SelectionWidget GUI around some items.
     * @param {number} boxRotation - the rotation of the selection GUI. Optional, defaults to 0
     * @param {paper.Item[]} items - the items to build the GUI around
     * @param {paper.Point} pivot - the pivot point that the selection rotates around. Defaults to (0,0)
     */
    build (args) {
        if(!args) args = {};
        if(!args.boxRotation) args.boxRotation = 0;
        if(!args.items) args.items = [];
        if(!args.pivot) args.pivot = new paper.Point();

        this._itemsInSelection = args.items;
        this._boxRotation = args.boxRotation;
        this._pivot = args.pivot;

        this._boundingBox = this._calculateBoundingBox();

        this.item.remove();
        this.item.removeChildren();

        if(this._ghost) {
            this._ghost.remove();
        }
        if(this._pivotPointHandle) {
            this._pivotPointHandle.remove();
        }

        if(this._itemsInSelection.length > 0) {
            this._center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;
            this._buildGUI();
            this.layer.addChild(this.item);
        }
    }

    /**
     *
     */
    startTransformation (item) {
        this._ghost = this._buildGhost();
        this._layer.addChild(this._ghost);

        if(item.data.handleType === 'rotation') {
            this.currentTransformation = 'rotate';
        } else if (item.data.handleType === 'scale') {
            this.currentTransformation = 'scale';
        } else if (item.data.handleType === 'skew') {
            this.currentTransformation = 'skew';
        } else {
            this.currentTransformation = 'translate';
        }

        this._ghost.data.initialPosition = this._ghost.position;
        this._ghost.data.scale = new paper.Point(1,1);
        this._ghost.data.shear = new paper.Point(0,0);
    }

    /**
     *
     */
    updateTransformation (item, e) {
        if(this.currentTransformation === 'translate') {
            this._ghost.position = this._ghost.position.add(e.delta);
        } else if(this.currentTransformation === 'scale') {
            var lastPoint = e.point.subtract(e.delta);
            var currentPoint = e.point;
            lastPoint = lastPoint.rotate(-this.boxRotation, this.pivot);
            currentPoint = currentPoint.rotate(-this.boxRotation, this.pivot);
            var pivotToLastPointVector = lastPoint.subtract(this.pivot);
            var pivotToCurrentPointVector = currentPoint.subtract(this.pivot);
            var scaleAmt = pivotToCurrentPointVector.divide(pivotToLastPointVector);

            // Lock scaling in a direction if the side handles are being dragged.
            if(item.data.handleEdge === 'topCenter' || item.data.handleEdge === 'bottomCenter') {
                scaleAmt.x = 1.0;
            }
            if(item.data.handleEdge === 'leftCenter' || item.data.handleEdge === 'rightCenter') {
                scaleAmt.y = 1.0;
            }

            // Holding shift locks aspect ratio
            if(e.modifiers.shift) {
                scaleAmt.y = scaleAmt.x;
            }

            this._ghost.data.scale = this._ghost.data.scale.multiply(scaleAmt);

            this._ghost.matrix = new paper.Matrix();
            this._ghost.rotate(-this.boxRotation);
            this._ghost.scale(this._ghost.data.scale.x, this._ghost.data.scale.y, this.pivot);
            this._ghost.rotate(this.boxRotation);
        } else if (this.currentTransformation === 'rotate') {
            var lastPoint = e.point.subtract(e.delta);
            var currentPoint = e.point;
            var pivotToLastPointVector = lastPoint.subtract(this.pivot);
            var pivotToCurrentPointVector = currentPoint.subtract(this.pivot);
            var pivotToLastPointAngle = pivotToLastPointVector.angle;
            var pivotToCurrentPointAngle = pivotToCurrentPointVector.angle;
            var rotation = pivotToCurrentPointAngle - pivotToLastPointAngle;
            this._ghost.rotate(rotation, this.pivot);
            this.boxRotation += rotation;
        } else if (this.currentTransformation === 'skew') {
            // Work in box-local (unrotated) space, same trick used for scaling.
            var lastPoint = e.point.subtract(e.delta);
            var currentPoint = e.point;
            lastPoint = lastPoint.rotate(-this.boxRotation, this.pivot);
            currentPoint = currentPoint.rotate(-this.boxRotation, this.pivot);
            var deltaLocal = currentPoint.subtract(lastPoint);

            var edge = item.data.handleEdge; // 'top' | 'bottom' | 'left' | 'right'
            var boxHeight = this.boundingBox.height || 1;
            var boxWidth = this.boundingBox.width || 1;

            if (edge === 'top' || edge === 'bottom') {
                // Dragging the top/bottom edge handle sideways shears
                // horizontally - normalize by box height so a drag of
                // roughly the box's own height feels like a full 45°ish skew.
                var dShearX = deltaLocal.x / boxHeight;
                if (edge === 'top') dShearX = -dShearX;
                this._ghost.data.shear = this._ghost.data.shear.add(new paper.Point(dShearX, 0));
            } else if (edge === 'left' || edge === 'right') {
                // Dragging the left/right edge handle up/down shears vertically.
                var dShearY = deltaLocal.y / boxWidth;
                if (edge === 'left') dShearY = -dShearY;
                this._ghost.data.shear = this._ghost.data.shear.add(new paper.Point(0, dShearY));
            }

            this._ghost.matrix = new paper.Matrix();
            this._ghost.rotate(-this.boxRotation);
            this._ghost.shear(this._ghost.data.shear.x, this._ghost.data.shear.y, this.pivot);
            this._ghost.rotate(this.boxRotation);
        }
    }

    /**
     *
     */
    finishTransformation (item) {
        if(!this._currentTransformation) return;

        this._ghost.remove();

        if(this.currentTransformation === 'translate') {
            var d = this._ghost.position.subtract(this._ghost.data.initialPosition);
            this.translateSelection(d);
        } else if(this.currentTransformation === 'scale') {
            this.scaleSelection(this._ghost.data.scale);
        } else if(this.currentTransformation === 'rotate') {
            this.rotateSelection(this._ghost.rotation);
        } else if(this.currentTransformation === 'skew') {
            this.skewSelection(this._ghost.data.shear);
        }

        this._currentTransformation = null;
    }

    /**
     *
     */
    translateSelection (delta) {
        this._itemsInSelection.forEach(item => {
            item.position = item.position.add(delta);
        });
        this.pivot = this.pivot.add(delta);
    }

    /**
     *
     */
    scaleSelection (scale) {
        this._itemsInSelection.forEach(item => {
            item.rotate(-this.boxRotation, this.pivot);
            item.scale(scale, this.pivot);
            item.rotate(this.boxRotation, this.pivot);
        });
    }

    /**
     *
     */
    rotateSelection (angle) {
        this._itemsInSelection.forEach(item => {
            item.rotate(angle, this.pivot);
        });
    }

    /**
     * Skews (shears) the selected items, turning their bounding rectangle
     * into a parallelogram.
     * @param {paper.Point} shear - the x/y shear amounts to apply.
     */
skewSelection (shear) {
    this._itemsInSelection.forEach(item => {
        var wickObject = Wick.ObjectCache.getObjectByUUID(item.data.wickUUID);

        if (wickObject && wickObject.transformation) {
            // Об'єкти з власною моделлю transformation (Wick.Clip, у тому
            // числі SVG, загорнуті в Clip - див. SVGAsset._wrapLeafItemInClip)
            // керуються ЦІЛКОМ через цю модель: View.Clip.render()
            // перебудовує matrix з нуля при КОЖНОМУ рендері (а рендер в
            // редакторі відбувається постійно). Пряму трансформацію живого
            // paper.js-об'єкта тут НЕ застосовуємо - вона однаково буде
            // відкинута найближчим render().
            //
            // (Раніше тут була спроба відрізнити "SVG-кліп" через
            // wickObject.objects.length і пропустити render() для нього -
            // Wick.Clip.objects взагалі не існує як властивість, тож це
            // завжди падало з "Cannot read properties of undefined
            // (reading 'length')". Реальна причина спотворення була не
            // тут, а в View.Clip.render()/generateBorder(): shear()
            // застосовувався ДО rotation, а group.rotation = X декомпозує
            // поточну матрицю для обчислення дельти обертання, що paper.js
            // сам вважає ненадійним/неможливим, якщо в матриці вже є shear
            // - це й давало видиме "розтягування". Тепер, коли render()
            // застосовує shear ОСТАННІМ (після rotation), його можна
            // викликати завжди.)
            var oldPos = new paper.Point(
                wickObject.transformation.x,
                wickObject.transformation.y
            );

            // Рахуємо, як саме зсув навколо pivot/boxRotation віджета
            // виділення (rotate -> shear -> rotate, точно та сама операція,
            // що й нижче в гілці для Path) впливає на точку прив'язки (x,y)
            // моделі, і застосовуємо цю ж геометричну операцію до самої
            // точки позиції, щоб pivot скосу візуально лишився на місці.
            var rotated = oldPos.rotate(-this.boxRotation, this.pivot);
            var relative = rotated.subtract(this.pivot);
            // Той самий 2-параметричний зсув, що й paper.js Item#shear(shx, shy):
            // x' = x + shx*y, y' = y + shy*x
            var sheared = new paper.Point(
                relative.x + shear.x * relative.y,
                relative.y + shear.y * relative.x
            ).add(this.pivot);
            var newPos = sheared.rotate(this.boxRotation, this.pivot);

            wickObject.transformation.x = newPos.x;
            wickObject.transformation.y = newPos.y;
            wickObject.transformation.skewX += shear.x;
            wickObject.transformation.skewY += shear.y;

            // ПРИМІТКА: корекція позиції вище точна, коли boxRotation === 0
            // (найпоширеніший випадок - об'єкт ще не обертали). Якщо об'єкт
            // одночасно й обертається, й скошується, адитивне накопичення
            // skewX/skewY - лише наближення.

            if (wickObject.view && wickObject.view.render) {
                wickObject.view.render();
            }
        } else {
            // Голі Path (і будь-що без власної моделі transformation) не
            // мають render(), який перебудовує matrix з моделі - для них
            // пряма трансформація живого paper.js-об'єкта є єдиним і
            // остаточним способом застосувати скіс.
            item.rotate(-this.boxRotation, this.pivot);
            item.shear(shear.x, shear.y, this.pivot);
            item.rotate(this.boxRotation, this.pivot);
        }
    });
}

    _buildGUI () {
        this.item.addChild(this._buildBorder());

        if(this._itemsInSelection.length > 1) {
            this.item.addChildren(this._buildItemOutlines());
        }

        let guiElements = [];

        guiElements.push(this._buildRotationHotspot('topLeft'));
        guiElements.push(this._buildRotationHotspot('topRight'));
        guiElements.push(this._buildRotationHotspot('bottomLeft'));
        guiElements.push(this._buildRotationHotspot('bottomRight'));

        guiElements.push(this._buildScalingHandle('topLeft'));
        guiElements.push(this._buildScalingHandle('topRight'));
        guiElements.push(this._buildScalingHandle('bottomLeft'));
        guiElements.push(this._buildScalingHandle('bottomRight'));
        guiElements.push(this._buildScalingHandle('topCenter'));
        guiElements.push(this._buildScalingHandle('bottomCenter'));
        guiElements.push(this._buildScalingHandle('leftCenter'));
        guiElements.push(this._buildScalingHandle('rightCenter'));

        guiElements.push(this._buildSkewHandle('top'));
        guiElements.push(this._buildSkewHandle('bottom'));
        guiElements.push(this._buildSkewHandle('left'));
        guiElements.push(this._buildSkewHandle('right'));

        this.item.addChildren(guiElements);

        this._pivotPointHandle = this._buildPivotPointHandle();
        this.layer.addChild(this._pivotPointHandle);

        this.item.rotate(this.boxRotation, this._center);

        this.item.children.forEach(child => {
            child.data.isSelectionBoxGUI = true;
        });
    }

    _buildBorder () {
        var border = new paper.Path.Rectangle({
            name: 'border',
            from: this.boundingBox.topLeft,
            to: this.boundingBox.bottomRight,
            strokeWidth: SelectionWidget.BOX_STROKE_WIDTH,
            strokeColor: SelectionWidget.BOX_STROKE_COLOR,
            insert: false,
        });
        border.data.isBorder = true;
        return border;
    }

    _buildItemOutlines () {
        return this._itemsInSelection.map(item => {
            var clone = item.clone({insert:false});
            clone.rotate(-this.boxRotation, this._center);
            var bounds = clone.bounds;
            var border = new paper.Path.Rectangle({
                from: bounds.topLeft,
                to: bounds.bottomRight,
                strokeWidth: SelectionWidget.BOX_STROKE_WIDTH,
                strokeColor: SelectionWidget.BOX_STROKE_COLOR,
            });
            //border.rotate(-this.boxRotation, this._center);
            border.remove();
            return border;
        });
    }

    _buildScalingHandle (edge) {
        var handle = this._buildHandle({
            name: edge,
            type: 'scale',
            center: this.boundingBox[edge],
            fillColor: SelectionWidget.HANDLE_FILL_COLOR,
            strokeColor: SelectionWidget.HANDLE_STROKE_COLOR,
        });
        return handle;
    }

    _buildSkewHandle (edge) {
        // edge is 'top' | 'bottom' | 'left' | 'right'. Positioned just
        // outside the midpoint of that edge (offset along the edge's
        // normal) so it doesn't overlap the scaling handle already sitting
        // right on the edge midpoint.
        var edgeCenterName = edge + 'Center'; // topCenter, bottomCenter, leftCenter, rightCenter
        var basePoint = this.boundingBox[edgeCenterName];
        var offset = SelectionWidget.SKEW_HANDLE_OFFSET / paper.view.zoom;

        var offsetVector;
        if (edge === 'top') {
            offsetVector = new paper.Point(0, -offset);
        } else if (edge === 'bottom') {
            offsetVector = new paper.Point(0, offset);
        } else if (edge === 'left') {
            offsetVector = new paper.Point(-offset, 0);
        } else {
            offsetVector = new paper.Point(offset, 0);
        }

        var center = basePoint.add(offsetVector);

        var r = (SelectionWidget.HANDLE_RADIUS / paper.view.zoom) * 1.4;
        var handle = new paper.Path.Rectangle({
            center: center,
            size: [r, r],
            strokeWidth: SelectionWidget.HANDLE_STROKE_WIDTH / paper.view.zoom,
            strokeColor: SelectionWidget.HANDLE_STROKE_COLOR,
            fillColor: SelectionWidget.HANDLE_FILL_COLOR,
            insert: false,
        });
        // Rotate into a diamond so it reads visually distinct from the
        // round scaling handles and the pie-shaped rotation hotspots.
        handle.rotate(45);
        handle.applyMatrix = false;

        handle.data.isSelectionBoxGUI = true;
        handle.data.handleType = 'skew';
        handle.data.handleEdge = edge;

        return handle;
    }

    _buildPivotPointHandle () {
        var handle = this._buildHandle({
            name: 'pivot',
            type: 'pivot',
            center: this.pivot,
            fillColor: SelectionWidget.PIVOT_FILL_COLOR,
            strokeColor: SelectionWidget.PIVOT_STROKE_COLOR,
        });
        handle.locked = true;
        return handle;
    }

    _buildHandle (args) {
        if(!args) console.error('_createHandle: args is required');
        if(!args.name) console.error('_createHandle: args.name is required');
        if(!args.type) console.error('_createHandle: args.type is required');
        if(!args.center) console.error('_createHandle: args.center is required');
        if(!args.fillColor) console.error('_createHandle: args.fillColor is required');
        if(!args.strokeColor) console.error('_createHandle: args.strokeColor is required');

        var circle = new paper.Path.Circle({
            center: args.center,
            radius: SelectionWidget.HANDLE_RADIUS / paper.view.zoom,
            strokeWidth: SelectionWidget.HANDLE_STROKE_WIDTH / paper.view.zoom,
            strokeColor: args.strokeColor,
            fillColor: args.fillColor,
            insert: false,
        });
        circle.applyMatrix = false;
        circle.data.isSelectionBoxGUI = true;
        circle.data.handleType = args.type;
        circle.data.handleEdge = args.name;
        return circle;
    }

    _buildRotationHotspot (cornerName) {
        // Build the not-yet-rotated hotspot, which starts out like this:

        //       |
        //       +---+
        //       |   |
        // ---+--+   |---
        //    |      |
        //    +------+
        //       |

        var r = SelectionWidget.ROTATION_HOTSPOT_RADIUS / paper.view.zoom;
        var hotspot = new paper.Path([
            new paper.Point(0,0),
            new paper.Point(0, r),
            new paper.Point(r, r),
            new paper.Point(r, -r),
            new paper.Point(-r, -r),
            new paper.Point(-r, 0),
        ]);
        hotspot.fillColor = SelectionWidget.ROTATION_HOTSPOT_FILLCOLOR;
        hotspot.position.x = this.boundingBox[cornerName].x;
        hotspot.position.y = this.boundingBox[cornerName].y;

        // Orient the rotation handles in the correct direction, even if the selection is flipped
        hotspot.rotate({
            'topRight': 0,
            'bottomRight': 90,
            'bottomLeft': 180,
            'topLeft': 270,
        }[cornerName]);

        // Some metadata.
        hotspot.data.handleType = 'rotation';
        hotspot.data.handleEdge = cornerName;

        return hotspot;
    }

    _buildGhost () {
        var ghost = new paper.Group({
            insert: false,
            applyMatrix: false,
        });

        this._itemsInSelection.forEach(item => {
            var outline = item.clone();
            outline.remove();
            outline.fillColor = 'rgba(0,0,0,0)';
            outline.strokeColor = SelectionWidget.GHOST_STROKE_COLOR;
            outline.strokeWidth = SelectionWidget.GHOST_STROKE_WIDTH * 2;
            ghost.addChild(outline);

            var outline2 = outline.clone();
            outline2.remove();
            outline2.fillColor = 'rgba(0,0,0,0)';
            outline2.strokeColor = '#ffffff';
            outline2.strokeWidth = SelectionWidget.GHOST_STROKE_WIDTH;
            ghost.addChild(outline2);
        });

        var boundsOutline = new paper.Path.Rectangle({
            from: this.boundingBox.topLeft,
            to: this.boundingBox.bottomRight,
            fillColor: 'rgba(0,0,0,0)',
            strokeColor: SelectionWidget.GHOST_STROKE_COLOR,
            strokeWidth: SelectionWidget.GHOST_STROKE_WIDTH,
            applyMatrix: false,
        });
        boundsOutline.rotate(this.boxRotation, this._center);
        ghost.addChild(boundsOutline);

        ghost.opacity = 0.5;

        return ghost;
    }

    _calculateBoundingBox () {
        if(this._itemsInSelection.length === 0) {
            return new paper.Rectangle();
        }

        var center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;

        var itemsForBoundsCalc = this._itemsInSelection.map(item => {
            var clone = item.clone();
            clone.rotate(-this.boxRotation, center);
            clone.remove();
            return clone;
        });

        return this._calculateBoundingBoxOfItems(itemsForBoundsCalc);
    }

    _calculateBoundingBoxOfItems (items) {
        var bounds = null;
        items.forEach(item => {
            bounds = bounds ? bounds.unite(item.bounds) : item.bounds;
        });
        return bounds || new paper.Rectangle();
    }
};

SelectionWidget.BOX_STROKE_WIDTH = 1;
SelectionWidget.BOX_STROKE_COLOR = 'rgba(100,150,255,1.0)';
SelectionWidget.HANDLE_RADIUS = 5;
SelectionWidget.HANDLE_STROKE_WIDTH = SelectionWidget.BOX_STROKE_WIDTH
SelectionWidget.HANDLE_STROKE_COLOR = SelectionWidget.BOX_STROKE_COLOR
SelectionWidget.HANDLE_FILL_COLOR = 'rgba(255,255,255,0.3)';
SelectionWidget.PIVOT_STROKE_WIDTH = SelectionWidget.BOX_STROKE_WIDTH;
SelectionWidget.PIVOT_FILL_COLOR = 'rgba(255,255,255,0.5)';
SelectionWidget.PIVOT_STROKE_COLOR = 'rgba(0,0,0,1)';
SelectionWidget.PIVOT_RADIUS = SelectionWidget.HANDLE_RADIUS
SelectionWidget.ROTATION_HOTSPOT_RADIUS = 20;
SelectionWidget.ROTATION_HOTSPOT_FILLCOLOR = 'rgba(100,150,255,0.5)';
SelectionWidget.SKEW_HANDLE_OFFSET = 16;
SelectionWidget.GHOST_STROKE_COLOR = 'rgba(0, 0, 0, 1.0)';
SelectionWidget.GHOST_STROKE_WIDTH = 1;

paper.PaperScope.inject({
    SelectionWidget: SelectionWidget,
});
