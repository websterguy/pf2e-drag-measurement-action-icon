const oneTexture = PIXI.Texture.from('modules/pf2e-drag-measurement-action-icon/images/one.webp');
const twoTexture = PIXI.Texture.from('modules/pf2e-drag-measurement-action-icon/images/two.webp');
const threeTexture = PIXI.Texture.from('modules/pf2e-drag-measurement-action-icon/images/three.webp');
const fourTexture = PIXI.Texture.from('modules/pf2e-drag-measurement-action-icon/images/threeplus.webp');
const sprite = new PIXI.Sprite(oneTexture);

let useDifficult = false;

function actionIconGetSegmentLabel(wrapped, segment, distance) {
    let label = wrapped(segment);
    if (game.pf2e.settings.dragMeasurement === "always" || (game.pf2e.settings.dragMeasurement === "encounters" && !!game.combat?.active)) {
        const units = canvas.grid.units;
        if (useDifficult) {
            if (segment.teleport || segment.cumulativeCost === 0) return label;
            if (!(segment.distance === segment.cost && (!segment.last || distance === segment.cumulativeCost))) {
                label = `⚠ ${ Math.round(segment.cost * 100) / 100 }${ !!units ? ' ' + units : '' } ${ segment.last ? '[' + Math.round(this.totalCost * 100) / 100 + (units ? ' ' + units : '') + ']' : '' }`;
            }
        }

        if (units === 'ft') {
            const actor = canvas.tokens.controlled[0].actor;
            const actions = Math.ceil(segment.cumulativeCost / actor.system.attributes.speed.total);
            segment.label.text = label;
            sprite.texture = actions > 3 ? fourTexture : actions === 3 ? threeTexture : actions === 2 ? twoTexture : oneTexture;
            segment.label.addChild(sprite);
            const scale = segment.label.height / sprite.texture.height;
            sprite.scale.set(scale, scale);
            sprite.position.y = -segment.label.height / 2;
            sprite.position.x = (segment.label.width / 2);
        }
    }
    return label;
}

Hooks.once('canvasInit', function() {
    libWrapper.register("pf2e-drag-measurement-action-icon", 'CONFIG.Canvas.rulerClass.prototype._getSegmentLabel', actionIconGetSegmentLabel, libWrapper.WRAPPER);
});

Hooks.once('init', function () {
    registerSettings();
    useDifficult = game.settings.get('pf2e-drag-measurement-action-icon', 'useDifficult') ?? false;
});

export const registerSettings = function () {
    game.settings.register('pf2e-drag-measurement-action-icon', 'useDifficult', {
        name: 'Use Difficult Terrain Calculation',
        hint: 'Uses the PF2e system\'s difficult terrain cost in the drag ruler distance display. The full distance and waypointed segments moving through difficult terrain will be marked with ⚠.',
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
        onChange: value => {
            useDifficult = value;
        }
    });
  };