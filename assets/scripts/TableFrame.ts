import { _decorator, Color, Component, Graphics } from 'cc';

const { ccclass } = _decorator;

@ccclass('TableFrame')
export class TableFrame extends Component {
    onLoad() {
        const graphics = this.node.addComponent(Graphics);
        const left = -358;
        const bottom = -678;
        const width = 716;
        const height = 1356;
        const lineWidth = 4;
        const offsetX = 4;
        const offsetY = -4;

        graphics.lineWidth = lineWidth;
        graphics.strokeColor = new Color(0, 0, 0, 51);
        graphics.rect(left + offsetX, bottom + offsetY, width, height);
        graphics.stroke();

        graphics.strokeColor = new Color(212, 175, 55, 255);
        graphics.rect(left, bottom, width, height);
        graphics.stroke();
    }
}
