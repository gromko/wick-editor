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

Wick.View.Timeline = class extends Wick.View {
    constructor (wickTimeline) {
        super();

        this.frameLayers = [];

        this.activeFrameContainers = [];
    }

    render () {
        this.frameLayers = [];

        var layersInRenderOrder = this.model.layers.filter(layer => {
            // A layer's project can be null here if this Timeline belongs to a
            // Clip that hasn't been attached to a Wick.Project yet (e.g. while
            // still being constructed by SVGAsset.walkItems/addClip's pre-render
            // step). In that case there's no "isPublished" state to check yet,
            // so just fall back to the layer's own hidden flag.
            return !layer.project || layer.project.isPublished || !layer.hidden;
        }).reverse();

        layersInRenderOrder.forEach(layer => {
            layer.view.render();
            this.frameLayers = this.frameLayers.concat(layer.view.onionSkinnedFramesLayers);
            this.frameLayers = this.frameLayers.concat(layer.view.activeFrameLayers);
        });
    }
}
