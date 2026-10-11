export type Velocity2D = { x: number; y: number };

export type BallConfig = {
    radius: number;
    speed: number;
    initialAngularSpeed: number;
};

export class BallModel {
    readonly radius: number;
    readonly speed: number;
    readonly initialAngularSpeed: number;

    private lastDirectionX = 1;
    private lastDirectionY = 0;

    constructor(config: BallConfig) {
        if (!isFinite(config.radius) || config.radius <= 0) {
            throw new Error(`BallModel: radius must be a finite positive number, got ${config.radius}`);
        }
        if (!isFinite(config.speed) || config.speed <= 0) {
            throw new Error(`BallModel: speed must be a finite positive number, got ${config.speed}`);
        }
        if (!isFinite(config.initialAngularSpeed)) {
            throw new Error(`BallModel: initialAngularSpeed must be finite, got ${config.initialAngularSpeed}`);
        }
        this.radius = config.radius;
        this.speed = config.speed;
        this.initialAngularSpeed = config.initialAngularSpeed;
    }

    createInitialVelocity(angleRadians: number): Velocity2D {
        if (!isFinite(angleRadians)) {
            throw new Error(`BallModel: angleRadians must be finite, got ${angleRadians}`);
        }
        const x = Math.cos(angleRadians);
        const y = Math.sin(angleRadians);
        const length = Math.sqrt(x * x + y * y);
        if (length > 0) {
            this.lastDirectionX = x / length;
            this.lastDirectionY = y / length;
        }
        return { x: this.lastDirectionX * this.speed, y: this.lastDirectionY * this.speed };
    }

    normalizeVelocity(velocity: Velocity2D): Velocity2D {
        if (!isFinite(velocity.x) || !isFinite(velocity.y)) {
            throw new Error(`BallModel: velocity components must be finite, got ${velocity.x}, ${velocity.y}`);
        }
        const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (length > 0) {
            this.lastDirectionX = velocity.x / length;
            this.lastDirectionY = velocity.y / length;
        }
        return { x: this.lastDirectionX * this.speed, y: this.lastDirectionY * this.speed };
    }
}
