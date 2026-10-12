import { _decorator, Color, Component, Font, HorizontalTextAlignment, Label, Node, Overflow, Sprite, SpriteFrame, UITransform, VerticalTextAlignment } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property
    symbol = '✖️';

    @property(Font)
    symbolFont: Font = null;

    @property(SpriteFrame)
    spriteFrame: SpriteFrame = null;

    private visual: Node = null;

    initialize(diameter: number) {
        if (this.visual) {
            return;
        }
        const ink = diameter * 2 / 3;
        this.visual = new Node('Visual');
        this.visual.layer = this.node.layer;
        this.visual.setPosition(0, 0, 0);
        const transform = this.visual.addComponent(UITransform);
        transform.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this.visual);

        if (this.spriteFrame) {
            const sprite = this.visual.addComponent(Sprite);
            sprite.spriteFrame = this.spriteFrame;
            sprite.color = Color.WHITE;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            sprite.trim = false;
            const size = this.spriteFrame.originalSize;
            const scale = ink / Math.max(size.width, size.height);
            transform.setContentSize(size.width * scale, size.height * scale);
        } else {
            const label = this.visual.addComponent(Label);
            // Keep the requested symbols, but render their monochrome text forms.
            label.string = this.symbol.replace(/[\uFE0E\uFE0F]/g, '') + '\uFE0E';
            if (this.symbolFont) {
                label.font = this.symbolFont;
                label.useSystemFont = false;
            }
            label.color = Color.BLACK;
            // BallSymbols normalizes both glyphs to 1 em ink and a 1.1 em advance.
            label.fontSize = ink;
            label.lineHeight = ink;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            transform.setContentSize(Math.ceil(ink * 1.1), ink);
        }
    }
}
