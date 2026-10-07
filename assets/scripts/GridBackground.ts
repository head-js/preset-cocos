import { _decorator, Color, Component, director, Director, Graphics, Node, screen, UITransform, view } from 'cc';

const { ccclass } = _decorator;

@ccclass('GridBackground')
export class GridBackground extends Component {
    private graphics: Graphics;

    onLoad() {
        this.graphics = this.node.addComponent(Graphics);
    }

    onEnable() {
        this.node.on(Node.EventType.SIZE_CHANGED, this.requestDraw, this);
        view.on('canvas-resize', this.requestDraw, this);
        view.on('design-resolution-changed', this.requestDraw, this);
        this.requestDraw();
    }

    onDisable() {
        this.node.off(Node.EventType.SIZE_CHANGED, this.requestDraw, this);
        view.off('canvas-resize', this.requestDraw, this);
        view.off('design-resolution-changed', this.requestDraw, this);
        director.off(Director.EVENT_BEFORE_DRAW, this.draw, this);
    }

    private requestDraw() {
        // Wait for Canvas and Widget to finish updating their sizes.
        director.off(Director.EVENT_BEFORE_DRAW, this.draw, this);
        director.once(Director.EVENT_BEFORE_DRAW, this.draw, this);
    }

    private draw() {
        const transform = this.getComponent(UITransform);
        const { width, height } = transform.contentSize;
        const left = -width * transform.anchorX;
        const bottom = -height * transform.anchorY;
        const right = left + width;
        const top = bottom + height;
        const spacing = 48;
        const graphics = this.graphics;

        graphics.clear();
        graphics.fillColor = Color.WHITE;
        graphics.rect(left, bottom, width, height);
        graphics.fill();

        const scaleX = view.getScaleX();
        const scaleY = view.getScaleY();
        const centerX = left + width / 2;
        const centerY = bottom + height / 2;
        const pixelLeft = -width * scaleX / 2;
        const pixelRight = width * scaleX / 2;
        const pixelBottom = -height * scaleY / 2;
        const pixelTop = height * scaleY / 2;
        const scale = Math.min(scaleX, scaleY);
        const pixelUnit = Math.max(1, Math.round(screen.devicePixelRatio));
        const linePixels = Math.max(pixelUnit, Math.round(scale / pixelUnit) * pixelUnit);
        const interceptWidth = Math.max(1, Math.round(linePixels * Math.SQRT2));
        const offset = interceptWidth / 4;
        const pitch = spacing * scale * Math.SQRT2;
        graphics.fillColor = new Color(192, 199, 208, 255);

        // Two perpendicular diagonal families form squares rotated by 45 degrees.
        for (const slope of [-1, 1]) {
            const minIntercept = pixelBottom - (slope === 1 ? pixelRight : -pixelLeft);
            const maxIntercept = pixelTop - (slope === 1 ? pixelLeft : -pixelRight);
            const first = Math.floor(minIntercept / pitch - 0.5);
            const last = Math.ceil(maxIntercept / pitch - 0.5);

            for (let i = first; i <= last; i++) {
                // Half a tile offset keeps the central tile centered, rather than a crossing.
                // Symmetric rounding preserves that center while equalizing pixel coverage.
                const rawIntercept = (i + 0.5) * pitch;
                const intercept = Math.sign(rawIntercept) * Math.round(Math.abs(rawIntercept) / pixelUnit) * pixelUnit;
                const start = slope === 1
                    ? Math.max(pixelLeft, pixelBottom - intercept)
                    : Math.max(pixelLeft, intercept - pixelTop);
                const end = slope === 1
                    ? Math.min(pixelRight, pixelTop - intercept)
                    : Math.min(pixelRight, intercept - pixelBottom);
                if (start > end) {
                    continue;
                }

                // Extend beyond the viewport so the diagonal strips reach every edge.
                const x1 = start - interceptWidth;
                const x2 = end + interceptWidth;
                const y1 = slope * x1 + intercept;
                const y2 = slope * x2 + intercept;
                const normalX = -slope * offset;
                graphics.moveTo(centerX + (x1 + normalX) / scaleX, centerY + (y1 + offset) / scaleY);
                graphics.lineTo(centerX + (x2 + normalX) / scaleX, centerY + (y2 + offset) / scaleY);
                graphics.lineTo(centerX + (x2 - normalX) / scaleX, centerY + (y2 - offset) / scaleY);
                graphics.lineTo(centerX + (x1 - normalX) / scaleX, centerY + (y1 - offset) / scaleY);
                graphics.close();
            }
        }
        graphics.fill();
    }
}
