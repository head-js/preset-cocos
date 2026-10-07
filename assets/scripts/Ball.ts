import { _decorator, CircleCollider2D, Color, Component, director, Director, Graphics, PHYSICS_2D_PTM_RATIO, PhysicsSystem2D, RigidBody2D, UITransform, Vec2 } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('Ball')
@requireComponent(UITransform)
export class Ball extends Component {
    @property(UITransform)
    table: UITransform = null;

    @property
    speed = 960;

    private body: RigidBody2D;
    private readonly direction = new Vec2();
    private readonly velocity = new Vec2();

    onLoad() {
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.gravity = Vec2.ZERO;
        this.getComponent(UITransform).setContentSize(24, 24);
        const graphics = this.node.addComponent(Graphics);
        graphics.fillColor = Color.BLACK;
        graphics.circle(0, 0, 12);
        graphics.fill();

        this.body = this.node.addComponent(RigidBody2D);
        this.body.gravityScale = 0;
        this.body.linearDamping = 0;
        this.body.angularDamping = 0;
        const collider = this.node.addComponent(CircleCollider2D);
        collider.radius = 12;
        collider.friction = 0;
        collider.restitution = 1;
        collider.apply();
    }

    onEnable() {
        director.on(Director.EVENT_AFTER_PHYSICS, this.keepSpeed, this);
    }

    onDisable() {
        director.off(Director.EVENT_AFTER_PHYSICS, this.keepSpeed, this);
    }

    start() {
        this.node.setWorldPosition(this.table.node.worldPosition);
        const angle = Math.random() * Math.PI * 2;
        this.direction.set(Math.cos(angle), Math.sin(angle));
        this.setVelocity();
    }

    private keepSpeed() {
        const velocity = this.body.linearVelocity;
        // Keep Box2D's outgoing direction, correcting only its speed.
        if (velocity.lengthSqr() > 0) {
            Vec2.normalize(this.direction, velocity);
        }
        this.setVelocity();
    }

    private setVelocity() {
        // Box2D velocity uses metres/s; the scene uses 32 world units/metre.
        this.velocity.set(
            this.direction.x * this.speed / PHYSICS_2D_PTM_RATIO,
            this.direction.y * this.speed / PHYSICS_2D_PTM_RATIO,
        );
        this.body.linearVelocity = this.velocity;
    }
}
