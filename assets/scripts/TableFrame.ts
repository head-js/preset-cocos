import { _decorator, Color, Component, Graphics, Node, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('TableFrame')
export class TableFrame extends Component {
    private graphics: Graphics;

    onLoad() {
        this.graphics = this.node.addComponent(Graphics);
    }

    onEnable() {
        this.node.parent.on(Node.EventType.SIZE_CHANGED, this.draw, this);
        this.draw();
    }

    onDisable() {
        this.node.parent.off(Node.EventType.SIZE_CHANGED, this.draw, this);
    }

    private draw() {
        const table = this.node.parent.getComponent(UITransform);
        const lineWidth = 4;
        const left = -table.width * table.anchorX + lineWidth / 2;
        const bottom = -table.height * table.anchorY + lineWidth / 2;
        const width = table.width - lineWidth;
        const height = table.height - lineWidth;
        const offsetX = 4;
        const offsetY = -4;
        const graphics = this.graphics;

        graphics.clear();
        graphics.lineWidth = lineWidth;
        graphics.strokeColor = new Color(0, 0, 0, 51);
        graphics.rect(left + offsetX, bottom + offsetY, width, height);
        graphics.stroke();

        graphics.strokeColor = new Color(212, 175, 55, 255);
        graphics.rect(left, bottom, width, height);
        graphics.stroke();
    }
}
