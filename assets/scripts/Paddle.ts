import { _decorator, BoxCollider2D, Color, Component, director, Director, ERigidBody2DType, EventTouch, game, Game, Graphics, input, Input, Node, RigidBody2D, screen, UITransform, Vec3, view } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('Paddle')
@requireComponent(UITransform)
export class Paddle extends Component {
    @property(UITransform)
    table: UITransform = null;

    private graphics: Graphics;
    private transform: UITransform;
    private collider: BoxCollider2D;
    private touchId: number | null = null;
    private previousPointerX = 0;
    private minX = 0;
    private maxX = 0;
    private renderScaleY = 0;
    private readonly pointer = new Vec3();

    onLoad() {
        this.transform = this.getComponent(UITransform);
        this.graphics = this.node.addComponent(Graphics);
        this.graphics.fillColor = Color.BLACK;
        this.node.addComponent(RigidBody2D).type = ERigidBody2DType.Animated;
        this.collider = this.node.addComponent(BoxCollider2D);
        this.collider.friction = 0;
        this.collider.restitution = 1;
    }

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        game.on(Game.EVENT_HIDE, this.releaseTouch, this);
        this.table.node.on(Node.EventType.SIZE_CHANGED, this.requestLayout, this);
        this.table.node.on(Node.EventType.TRANSFORM_CHANGED, this.requestLayout, this);
        view.on('canvas-resize', this.requestLayout, this);
        view.on('design-resolution-changed', this.requestLayout, this);
        this.requestLayout();
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        game.off(Game.EVENT_HIDE, this.releaseTouch, this);
        this.table.node.off(Node.EventType.SIZE_CHANGED, this.requestLayout, this);
        this.table.node.off(Node.EventType.TRANSFORM_CHANGED, this.requestLayout, this);
        view.off('canvas-resize', this.requestLayout, this);
        view.off('design-resolution-changed', this.requestLayout, this);
        director.off(Director.EVENT_BEFORE_DRAW, this.layout, this);
        this.releaseTouch();
    }

    lateUpdate() {
        if (this.getRenderScaleY() !== this.renderScaleY) {
            this.requestLayout();
        }
    }

    private getRenderScaleY() {
        // Convert design units to screen logical pixels, including Canvas scaling.
        return view.getScaleY() * Math.abs(this.node.worldScale.y) / screen.devicePixelRatio;
    }

    private requestLayout() {
        director.off(Director.EVENT_BEFORE_DRAW, this.layout, this);
        director.once(Director.EVENT_BEFORE_DRAW, this.layout, this);
    }

    private layout() {
        this.renderScaleY = this.getRenderScaleY();
        const width = this.table.width / 2;
        const height = 2 / this.renderScaleY;
        const left = this.table.node.position.x - this.table.width * this.table.anchorX;
        const bottom = this.table.node.position.y - this.table.height * this.table.anchorY;
        this.minX = left + width / 2;
        this.maxX = left + this.table.width - width / 2;
        this.transform.setContentSize(width, height);
        this.collider.size.set(width, height);
        this.collider.apply();
        // The paddle's top edge touches the Table's outer bottom edge.
        this.node.setPosition(this.clampX(this.node.position.x), bottom - height / 2, 0);
        this.graphics.clear();
        this.graphics.rect(-width / 2, -height / 2, width, height);
        this.graphics.fill();
    }

    private clampX(x: number) {
        return Math.max(this.minX, Math.min(this.maxX, x));
    }

    private getPointerX(event: EventTouch) {
        const location = event.getUILocation();
        this.pointer.set(location.x, location.y, 0);
        return this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(this.pointer, this.pointer).x;
    }

    private onTouchStart(event: EventTouch) {
        if (this.touchId !== null) {
            return;
        }
        this.touchId = event.getID();
        this.previousPointerX = this.getPointerX(event);
    }

    private onTouchMove(event: EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) {
            return;
        }
        const pointerX = this.getPointerX(event);
        const x = this.clampX(this.node.position.x + pointerX - this.previousPointerX);
        this.previousPointerX = pointerX;
        this.node.setPosition(x, this.node.position.y, this.node.position.z);
    }

    private onTouchEnd(event: EventTouch) {
        if (event.getID() === this.touchId) {
            this.releaseTouch();
        }
    }

    private releaseTouch() {
        this.touchId = null;
    }
}
