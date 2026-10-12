import { _decorator, CircleCollider2D, Component, director, Director, PHYSICS_2D_PTM_RATIO, PhysicsSystem2D, RigidBody2D, UITransform, Vec2 } from 'cc';
import { BallModel } from './domain/BallModel';
import { BallView } from './BallView';

const { ccclass, property, requireComponent } = _decorator;

// Physics group index 1 (bit 1 << 1) as defined in settings/v2/packages/project.json;
// the Ball-vs-Ball matrix entry is off, so two balls pass through each other.
const BALL_GROUP = 1 << 1;

@ccclass('Ball')
@requireComponent(UITransform)
export class Ball extends Component {
    @property(UITransform)
    table: UITransform = null;

    @property
    radius = 48;

    @property
    speed = 960;

    @property
    initialAngularSpeed = 90;

    private model: BallModel;
    private view: BallView = null;
    private body: RigidBody2D;
    private readonly velocity = new Vec2();

    onLoad() {
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.gravity = Vec2.ZERO;
        this.model = new BallModel({
            radius: this.radius,
            speed: this.speed,
            initialAngularSpeed: this.initialAngularSpeed,
        });
        const diameter = this.model.radius * 2;
        this.getComponent(UITransform).setContentSize(diameter, diameter);
        this.view = this.getComponent(BallView);
        if (this.view) {
            this.view.initialize(diameter);
        }

        this.body = this.node.addComponent(RigidBody2D);
        this.body.group = BALL_GROUP;
        this.body.gravityScale = 0;
        this.body.linearDamping = 0;
        this.body.angularDamping = 0;
        this.body.fixedRotation = false;
        const collider = this.node.addComponent(CircleCollider2D);
        collider.radius = this.model.radius;
        collider.offset.set(0, 0);
        collider.friction = 0;
        collider.restitution = 1;
        collider.group = BALL_GROUP;
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
        const velocity = this.model.createInitialVelocity(angle);
        this.body.linearVelocity = this.toBox2DVelocity(velocity);
        this.body.angularVelocity = this.model.initialAngularSpeed * Math.PI / 180;
    }

    private keepSpeed() {
        const velocity = this.body.linearVelocity;
        const normalized = this.model.normalizeVelocity({
            x: velocity.x * PHYSICS_2D_PTM_RATIO,
            y: velocity.y * PHYSICS_2D_PTM_RATIO,
        });
        this.body.linearVelocity = this.toBox2DVelocity(normalized);
    }

    private toBox2DVelocity(velocity: { x: number; y: number }) {
        // Box2D velocity uses metres/s; the scene uses 32 world units/metre.
        this.velocity.set(
            velocity.x / PHYSICS_2D_PTM_RATIO,
            velocity.y / PHYSICS_2D_PTM_RATIO,
        );
        return this.velocity;
    }
}
