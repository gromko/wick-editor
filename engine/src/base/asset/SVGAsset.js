/*
 * Copyright 2026 WICKLETS LLC
 * * This file is part of Wick Engine.
 */

Wick.SVGAsset = class extends Wick.FileAsset {
    /**
     * Returns all valid MIME types for files which can be converted to SVGAssets.
     * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
     */
    static getValidMIMETypes() {
        return ['image/svg+xml'];
    }

    /**
     * Returns all valid extensions types for files which can be attempted to be
     * converted to SVGAssets.
     * @return  {string[]} Array of strings representing extensions.
     */
    static getValidExtensions() {
        return ['.svg']
    }

    /**
     * Create a new SVGAsset.
     * @param {object} args
     */
    constructor(args) {
        super(args);
    }

    _serialize(args) {
        var data = super._serialize(args);
        return data;
    }

    _deserialize(data) {
        super._deserialize(data);
    }

    get classname() {
        return 'SVGAsset';
    }

    /**
     * A list of all Wick.Clips in the project that were created from this
     * SVGAsset (i.e. whose assetSourceUUID points back to this asset).
     * @returns {Wick.Clip[]}
     */
    getInstances() {
        if (!this.project) return [];

        return this.project.getChildrenRecursive().filter(obj => {
            return obj instanceof Wick.Clip && obj.assetSourceUUID === this.uuid;
        });
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances() {
        return this.getInstances().length > 0;
    }

    /**
     * Removes all Clips using this asset as their source from the project.
     *
     * WHY THIS MATTERS: Wick.Project.removeAsset() calls
     * asset.removeAllInstances() BEFORE unlinking the asset itself. Without
     * a real implementation here, deleting an SVGAsset from the Asset
     * Library (e.g. via the delete button) removed only the Wick.Asset -
     * any Wick.Clip already placed on the canvas from that asset was left
     * behind with a dangling assetSourceUUID pointing at an asset that no
     * longer exists in the project. That orphaned clip then broke
     * subsequent operations, including importing another SVG.
     */
    removeAllInstances() {
        this.getInstances().forEach(instance => {
            if (instance.parent) {
                instance.parent.removeChild(instance);
            }
        });
    }

    /**
     * Load data in the asset
     */
    load(callback) {
        // We don't need to do anything here, the data for SVGAssets is just SVG
        callback();
    }

    /**
     * Wraps a single leaf paper.js item (a Path, CompoundPath, Raster,
     * SymbolItem, PointText - anything that isn't a Layer or Group) in a
     * Wick.Clip, the same way the paper.Group branch of walkItems() already
     * wraps grouped content.
     *
     * WHY THIS MATTERS: a bare Wick.Path has no .transformation - no
     * independent x/y/scaleX/scaleY/rotation/skewX/skewY model at all, only
     * baked-in geometry (see Wick.Path / Wick.View.Path). That causes two
     * concrete bugs for "simple" SVGs (ones with no surrounding <g>, which
     * used to fall straight into `wickItem = new Wick.Path(...)` below
     * without ever being wrapped):
     *
     *   1. _breakAppartShapesRecursively() sets `item.applyMatrix = true`
     *      on the whole imported tree before conversion. If the source SVG
     *      had e.g. <g transform="rotate(15)"> around the shape, that
     *      rotation gets baked directly into the path's own point
     *      coordinates - there's no separate "rotation" left to read back
     *      out afterwards.
     *   2. Wick.Selection._resetPositioningValues() has no rotation to
     *      read for a Path (it isn't a Clip), so it hardcodes
     *      boxRotation = 0. Paper.SelectionWidget then shears in raw
     *      screen/world axes with no compensation for the shape's actual
     *      (baked-in, tilted) orientation, AND
     *      Paper.SelectionWidget#skewSelection() silently drops the skew
     *      entirely for a Path (`if (wickObject && wickObject.transformation)`
     *      is false), so nothing is even persisted correctly.
     *
     * Wrapping the leaf item in a Clip gives it a real transformation to
     * skew (and rotate) against, exactly like grouped SVG content already
     * gets, so both of the above become non-issues.
     *
     * @param {paper.Item} item - the leaf paper.js item to wrap.
     * @returns {Wick.Clip} a Clip containing a single Wick.Path built from `item`.
     */
    static _wrapLeafItemInClip(item) {
        var leafPath = new Wick.Path({
            json: item.exportJSON()
        });

        // Same centering trick used for Group above: use the item's own
        // bounding box center as the Clip's transformation origin, rather
        // than defaulting to (0,0) (which for imported SVG content usually
        // lands in the top-left corner of the artwork instead of its
        // center).
        var bounds = item.bounds;
        var center = bounds.center;

        var clip = new Wick.Clip({
            transformation: new Wick.Transformation({ x: center.x, y: center.y }),
        });
        clip.addObjects([leafPath]);

        return clip;
    }

    /**
     * Walks through the items tree creating the apprptiate wick object for each node*
     * @param {paper.Item} item - called when the Path is done loading.
     * @returns {Wick.Base}
     */
    static walkItems(item) {
            // 2026 create paths for all the path items, this also needs to be done for the following item.className=:
            // 'Group', 'Layer', 'Path', 'CompoundPath', 'Shape', 'Raster', 'SymbolItem', 'PointText'
            // I think path automatically handles this, but maybe not layer or group
            var wickItem = null; // Groups (clips) and layers do this differently so they must be handled separately

            if (item instanceof paper.Layer || (item.name !== null && item.name.startsWith("layer") && item instanceof paper.Group)) {
                wickItem = new Wick.Layer(); // If we've just added a layer set it to be the active layer
                //TODO: Find out how multiple layers are handled

                var frame = new Wick.Frame();
                wickItem.addFrame(frame);
                var groupChildren = Array.from(item.children); //prevent any side effects
                groupChildren.forEach(childItem => {
                    var wickChildItem = Wick.SVGAsset.walkItems(childItem).copy();

                    if (wickChildItem instanceof Wick.Clip) {
                        frame.addClip(wickChildItem);
                    } else if (wickChildItem instanceof Wick.Path) {
                        frame.addPath(wickChildItem);
                    } else if (wickChildItem instanceof Wick.Layer) {
                        frame.addLayer(wickChildItem);
                        //console.error("SVG Import: Error importing, nested layers.ignoring."); // Insert text
                    } else {
                        console.error("SVG Import: Unknown item type.".concat(wickChildItem.classname)); // Insert text
                    }
                });
            } else if (item instanceof paper.Group) {
                // Compute the bounding box center of this group's paper.js geometry
                // BEFORE we tear it apart into Wick objects, so we can use it as the
                // new Clip's transformation origin. Without this, the Clip defaults
                // to an origin of (0,0), which for imported SVG content usually lands
                // in the top-left corner of the artwork instead of its center. That
                // mismatched pivot is what the canvas Selection widget uses as the
                // center of scaling, causing resize handles near that corner to
                // compute wildly incorrect (sometimes inverted) scale factors.
                var groupBounds = item.bounds;
                var center = groupBounds.center;

                wickItem = new Wick.Clip({
                    transformation: new Wick.Transformation({ x: center.x, y: center.y }),
                });
                var wickObjects = [];
                var layers = [];
                var groupChildren = Array.from(item.children); //prevent any side effects
                groupChildren.forEach(childItem => {
                    var clipActiveLayer = wickItem.activeLayer;
                    ///This should be clips and paths not layers
                    var walkItem = Wick.SVGAsset.walkItems(childItem).copy();

                    if (walkItem instanceof Wick.Layer) {
                        //console.error("SVG Import: Clip has a child that is a layer, this should never happen. ignoring."); // Insert text
                        layers.push(walkItem);
                        clipActiveLayer.activate();
                    } else {
                        wickObjects.push(walkItem);
                    }
                });
                // addObjects repositions each object by subtracting the Clip's
                // transformation (now the center we just computed), so the content
                // ends up correctly centered around the Clip's local origin.
                wickItem.addObjects(wickObjects); //add the items to the project
                // add layers after onjects so the objexts don't get bound to the new layer
                var layersCopy = Array.from(layers); //prevent any side effects
                layersCopy.forEach(layer => {
                    wickItem.timeline.addLayer(layer);
                });
            } else if (item instanceof paper.Shape) {
                //console.error("SVG Import: Item is an instance of a shape. This should never happen as all shapes should be converted to paths when we call paperProject.importSVG(data, options.expandShapes = true);");
                // Wrapped in a Clip for the same reason as the branch below -
                // see _wrapLeafItemInClip's doc comment.
                wickItem = Wick.SVGAsset._wrapLeafItemInClip(item.clone().toPath());
            } else {
                //'Path', 'CompoundPath', 'Raster', 'SymbolItem', 'PointText' all handled by Path which takes the loaded paper object expressed as JSON to load
                //
                // These are wrapped in a Wick.Clip rather than left as a bare
                // Wick.Path - see _wrapLeafItemInClip's doc comment for why:
                // in short, a bare Path has no .transformation, so it can't
                // correctly hold a rotation or a skew, which for "simple"
                // SVGs (no surrounding <g>) used to turn a skew drag into a
                // visible rotation-like distortion once the shape had any
                // baked-in tilt from the source file.
                wickItem = Wick.SVGAsset._wrapLeafItemInClip(item);
            }

            return wickItem;
        }
        /**
         * Walks through the items tree creating the appropriate wick object for each node
         * @param {Paper.Item} item - the item to turn into paths
         */

    /**
     * Walks through the items tree converting shapes into paths. This should be possible to do in the walkitems routine
     * @param {Paper.Item} item - called when the Path is done loading.
     */
    static _breakAppartShapesRecursively(item) {
        item.applyMatrix = true;
        if (item instanceof paper.Group || item instanceof paper.Layer) {
            var children = Array.from(item.children);
            children.forEach(childItem => {
                Wick.SVGAsset._breakAppartShapesRecursively(childItem);
            })
        } else if (item instanceof paper.Shape) { //This should have been done automatically by the import options, spo shouldn't be needed
            var path = item.toPath();
            //item.parent.addChild(path);
            //path.insertAbove(item);
            //item.remove();
            item.replaceWith(path);
        }
    }


    /**
     * Scales a paper.js item down (preserving aspect ratio) so it fits
     * within a target percentage of the canvas dimensions, if it's
     * currently larger than that in either dimension. Never scales UP -
     * SVGs that are already smaller than the target area are left alone.
     * @param {paper.Item} item - the item to scale, modified in place.
     * @param {Wick.Project} project - the project whose canvas size to fit within.
     * @param {number} [targetRatio=0.8] - the fraction of the canvas dimensions to fit within.
     */
    static _scaleToFitCanvas(item, project, targetRatio) {
        if (!project) {
            console.warn('SVGAsset: Could not scale imported SVG to fit the canvas, no project was given.');
            return;
        }
        if (targetRatio === undefined) targetRatio = 0.8;

        var bounds = item.bounds;
        if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;

        var maxWidth = project.width * targetRatio;
        var maxHeight = project.height * targetRatio;

        // Already fits - don't touch it (in particular, don't scale UP).
        if (bounds.width <= maxWidth && bounds.height <= maxHeight) return;

        var scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);

        // Scale around the artwork's own center so it doesn't jump/shift -
        // walkItems() re-centers everything relative to the Clip's origin
        // afterward anyway, but this keeps the geometry itself tidy.
        item.scale(scale, bounds.center);
    }

    /**
     * Creates a new Wick SVG that uses this asset's data.
     * @param {function} callback - called when the SVG is done loading.
     */


    createInstance(callback) {
        // needs to take a base64 encoded string.
        //we need a viewSVG and an SVG object that extends base by the looks of things.

        /*
                var myPath = new paper.Path();
                myPath.strokeColor = 'black';
                myPath.add(new paper.Point(0, 0));
                myPath.add(new paper.Point(100, 50));
                var anItem = this.walkItems(myPath);
                this.project.addObject(anItem);
                var myLayer = new paper.Layer();
                var secondPath = new paper.Path.Circle(new paper.Point(150, 50), 35);
                secondPath.fillColor = 'green';
                var aLayer = this.walkItems(myLayer);
                this.project.addObject(aLayer);
                    // Create two circle shaped paths:
                var firstPath = new paper.Path.Circle(new paper.Point(80, 50), 35);
                var secondPath = new paper.Path.Circle(new paper.Point(120, 50), 35);
                var group = new paper.Group([firstPath, secondPath]);
                // Change the fill color of the items contained within the group:
                group.style = {
                    fillColor: 'red',
                    strokeColor: 'black'
                };
                var agroup = this.walkItems(group);
                this.project.addObject(agroup);
          */
        var self = this;
        var importSVG = function(data) {
            // paper.project.importSVG() auto-creates a new paper.Layer for
            // the <svg> root and immediately makes it the project's active
            // layer. Unlike regular Items, Layers ignore `insert: false` -
            // they always register themselves into project.layers[] and
            // activate themselves. walkItems() below only READS this raw
            // tree to build the Wick object tree; it never removes it.
            //
            // Left uncleaned, every SVG import stacks another orphaned
            // Layer onto paper.project and leaves the wrong layer active -
            // which is why importing a SECOND SVG breaks, even after the
            // first one's Wick.Clip has been deleted from the timeline:
            // the corruption lives in paper.js's own project state, not in
            // the Wick data model, so deleting the Wick object never
            // cleans it up.
            var activeLayerBeforeImport = paper.project.activeLayer;

            var item = paper.project.importSVG(data, {
                expandShapes: true,
                insert: false
            });
            Wick.SVGAsset._breakAppartShapesRecursively(item);

            // Large SVGs can easily be bigger than the canvas (SVG authors
            // often work at arbitrary/large document sizes). Scale the
            // artwork down - preserving aspect ratio - to fit within 80% of
            // the canvas before converting it into Wick objects, so it
            // doesn't dwarf or overflow the stage the moment it's inserted.
            Wick.SVGAsset._scaleToFitCanvas(item, self.project);

            var wickItem = Wick.SVGAsset.walkItems(item).copy();

            // Tag the created Clip with a reference back to this asset.
            // Without this, getInstances() (above) can never find this
            // Clip later on, since it has nothing to match against - the
            // deletion path (Project.removeAsset -> removeAllInstances)
            // would silently do nothing, leaving orphaned SVG clips on
            // the canvas after their source asset is deleted.
            wickItem.assetSourceUUID = self.uuid;

            // Clean up the raw import: remove the paper.js tree (and the
            // stray Layer it may have created) now that its content has
            // been copied into wickItem, and restore whichever layer was
            // active before this import so paper.project's state is
            // exactly as it was prior to calling importSVG().
            item.remove();
            if (activeLayerBeforeImport) {
                activeLayerBeforeImport.activate();
            }

            callback(wickItem);
        };

        Wick.SVGFile.fromSVGFile(this.src, importSVG);
    }

};
