import { _decorator, BoxCollider2D, Color, Component, ERigidBody2DType, Graphics, Node, RigidBody2D, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('TableFrame')
export class TableFrame extends Component {
    private graphics: Graphics;
    private walls: BoxCollider2D[] = [];

    onLoad() {
        this.graphics = this.node.addComponent(Graphics);
        this.node.addComponent(RigidBody2D).type = ERigidBody2DType.Static;
        for (let i = 0; i < 3; i++) {
            const wall = this.node.addComponent(BoxCollider2D);
            wall.friction = 0;
            wall.restitution = 1;
            this.walls.push(wall);
        }
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
        const bottom = -table.height * table.anchorY;
        const width = table.width - lineWidth;
        const height = table.height - lineWidth / 2;
        const offsetX = 4;
        const offsetY = -4;
        const graphics = this.graphics;

        // Only the gold top, left and right edges collide; the bottom is open.
        this.setWall(this.walls[0], left, bottom + table.height / 2, lineWidth, table.height);
        this.setWall(this.walls[1], left + width, bottom + table.height / 2, lineWidth, table.height);
        this.setWall(this.walls[2], left + width / 2, bottom + height, table.width, lineWidth);

        graphics.clear();
        graphics.lineWidth = lineWidth;
        graphics.strokeColor = new Color(0, 0, 0, 51);
        this.drawOpenFrame(left + offsetX, bottom + offsetY, width, height);

        graphics.strokeColor = new Color(212, 175, 55, 255);
        this.drawOpenFrame(left, bottom, width, height);
    }

    private setWall(wall: BoxCollider2D, x: number, y: number, width: number, height: number) {
        wall.offset.set(x, y);
        wall.size.set(width, height);
        wall.apply();
    }

    private drawOpenFrame(left: number, bottom: number, width: number, height: number) {
        const graphics = this.graphics;
        graphics.moveTo(left, bottom);
        graphics.lineTo(left, bottom + height);
        graphics.lineTo(left + width, bottom + height);
        graphics.lineTo(left + width, bottom);
        graphics.stroke();
    }
}
