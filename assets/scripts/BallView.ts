import { _decorator, Color, Component, HorizontalTextAlignment, Label, Node, Overflow, Sprite, SpriteFrame, UITransform, VerticalTextAlignment } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property
    symbol = '✖️';

    @property(SpriteFrame)
    spriteFrame: SpriteFrame = null;

    private visual: Node = null;
    private initialized = false;

    initialize(diameter: number) {
        const ink = diameter * 2 / 3;
        if (!this.initialized || !this.visual) {
            if (this.visual) {
                this.visual.destroy();
            }
            this.visual = new Node('Visual');
            this.visual.layer = this.node.layer;
            this.visual.setPosition(0, 0, 0);
            this.visual.addComponent(UITransform);
            const transform = this.visual.getComponent(UITransform);
            transform.setAnchorPoint(0.5, 0.5);
            this.node.addChild(this.visual);
            if (this.spriteFrame) {
                const sprite = this.visual.addComponent(Sprite);
                sprite.spriteFrame = this.spriteFrame;
                sprite.color = Color.WHITE;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                transform.setContentSize(ink, ink);
            } else {
                const label = this.visual.addComponent(Label);
                label.string = this.symbol;
                label.color = Color.BLACK;
                // Measured on macOS (CoreText): ✖️ ink is 1.0 em square, advance 1.08 em,
                // glyph y ∈ [-0.125, +0.875] em around the alphabetic baseline. With
                // lineHeight = fontSize the web renderer's CENTER baseline (0.87 em from
                // the box top) puts the ink centered in the node box, so ink = fontSize.
                label.fontSize = ink;
                label.lineHeight = ink;
                label.horizontalAlign = HorizontalTextAlignment.CENTER;
                label.verticalAlign = VerticalTextAlignment.CENTER;
                label.overflow = Overflow.SHRINK;
                // Width 1.1 x ink keeps the 1.08 em advance from triggering SHRINK.
                transform.setContentSize(Math.ceil(ink * 1.1), ink);
            }
            this.initialized = true;
        }
    }
}
