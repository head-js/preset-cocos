import { _decorator, Color, Component, Label, Node } from 'cc';

const { ccclass } = _decorator;

@ccclass('Hello')
export class Hello extends Component {
    start() {
        const node = new Node('Hello');
        node.layer = this.node.layer;
        this.node.addChild(node);

        const label = node.addComponent(Label);
        label.string = 'Hello Cocos';
        label.color = Color.BLACK;
        label.fontSize = 48;
        label.lineHeight = 60;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
    }
}
