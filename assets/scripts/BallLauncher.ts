import { _decorator, Component, game, Game, instantiate, Prefab, UITransform } from 'cc';
import { Ball } from './Ball';
import { BallView } from './BallView';

const { ccclass, property } = _decorator;

@ccclass('BallLauncher')
export class BallLauncher extends Component {
    @property(Prefab)
    ballPrefab: Prefab = null;

    @property(UITransform)
    table: UITransform = null;

    @property
    launchInterval = 0.5;

    private pendingSecond = false;
    private remaining = 0;
    private skipDelta = false;

    private readonly launchSecond = () => {
        this.pendingSecond = false;
        this.spawnBall('➕', 'BallPlus');
    };

    onEnable() {
        game.on(Game.EVENT_PAUSE, this.pauseCountdown, this);
        game.on(Game.EVENT_RESUME, this.resumeCountdown, this);
    }

    start() {
        this.validate();
        this.spawnBall('✖️', 'BallCross');
        this.pendingSecond = true;
        this.remaining = this.launchInterval;
        this.skipDelta = true;
        this.scheduleOnce(this.launchSecond, this.remaining);
    }

    update(dt: number) {
        if (!this.pendingSecond || game.isPaused()) {
            return;
        }
        if (this.skipDelta) {
            this.skipDelta = false;
            return;
        }
        this.remaining = Math.max(0, this.remaining - dt);
    }

    onDisable() {
        game.off(Game.EVENT_PAUSE, this.pauseCountdown, this);
        game.off(Game.EVENT_RESUME, this.resumeCountdown, this);
        this.unschedule(this.launchSecond);
        this.pendingSecond = false;
    }

    private pauseCountdown() {
        this.unschedule(this.launchSecond);
    }

    private resumeCountdown() {
        if (!this.pendingSecond) {
            return;
        }
        // Creator 3.8.6 may include a short pause in the first resumed frame's dt.
        // Re-arm the timer so its initialization frame discards that wall-clock gap.
        this.skipDelta = true;
        this.scheduleOnce(this.launchSecond, this.remaining);
    }

    private validate() {
        if (!this.ballPrefab) {
            throw new Error('BallLauncher: ballPrefab is not bound');
        }
        if (!this.table) {
            throw new Error('BallLauncher: table is not bound');
        }
        if (!Number.isFinite(this.launchInterval) || this.launchInterval <= 0) {
            throw new Error(`BallLauncher: launchInterval must be a finite positive number, got ${this.launchInterval}`);
        }
    }

    private spawnBall(symbol: string, name: string) {
        const instance = instantiate(this.ballPrefab);
        if (instance.active) {
            instance.destroy();
            throw new Error('BallLauncher: ballPrefab root must be inactive before configuration');
        }
        const ball = instance.getComponent(Ball);
        const view = instance.getComponent(BallView);
        if (!ball || !view) {
            instance.destroy();
            throw new Error('BallLauncher: ballPrefab must carry Ball and BallView components');
        }
        ball.table = this.table;
        view.symbol = symbol;
        instance.name = name;
        instance.layer = this.node.parent.layer;
        this.node.parent.addChild(instance);
        instance.active = true;
    }
}
