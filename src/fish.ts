import { app } from "./main"
import { Renderer } from "./renderer"
/**
 *  鱼水平方向匀速运动 竖直方向 水下加速度向上 水上和重力加速度叠加后合加速度向下
 */
export class Fish {
    static GRAVITY = 0.4;
    direction: boolean//true向右
    x: number
    vx: number//速度
    ax: number//加速度
    y: number
    vy: number
    ay: number
    previousY: number
    hadOut: boolean//已经出水过
    theta: number//鱼鳍转动脚
    phi: number//鱼尾摆动角
    constructor() {
        this.init()
    }
    init() {
        this.direction = Math.random() < 0.5
        this.x = this.direction ? (app.width + Renderer.THRESHOLD) : - Renderer.THRESHOLD;//屏幕外一个THRESHOLD的距离
        this.y = this.getRandomValue(app.height * 0.6, app.height * 0.9)//0.6-0.9 比水底略高 水面略低
        this.previousY = this.y;
        this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1)
        this.vy = this.getRandomValue(-5, -2)//速度向上
        this.ay = this.getRandomValue(-0.2, -0.05)

        this.hadOut = false;
        this.theta = 0;
        this.phi = 0;

    }
    updateStatus() {
        this.previousY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.ay;

        this.theta += Math.PI / 20;//9度  
        this.theta %= Math.PI * 2;
        this.phi += Math.PI / 30;//6度 60帧一圈
        this.phi %= Math.PI * 2;
        if (this.y < app.getSurfaceHeight()) {
            this.vy += Fish.GRAVITY;
            this.hadOut = true;
        } else if (this.hadOut) {
            this.ay = this.getRandomValue(-0.2, -0.05);//重新入水时重新分配初始加速度
            this.hadOut = false;
        }
        app.generateEpicenter(this.x + (this.direction ? -30 : 30)/**视觉效果修正项 */, this.y, this.y - this.previousY);//TODO 尝试用vy代替

        if ((this.vx > 0 && this.x > app.width + Renderer.THRESHOLD) || (this.vx < 0 && this.x < -Renderer.THRESHOLD)) {
            this.init();
        }
    }
    getRandomValue(min: number, max: number): number {
        return min + (max - min) * Math.random()
    }
    render(context: CanvasRenderingContext2D) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
        context.scale(1, this.direction ? 1 : -1);
        context.beginPath();
        context.moveTo(-30, 0);

        context.bezierCurveTo(-20, 15, 15, 10, 40, 0);//上鱼身
        context.bezierCurveTo(15, -10, -20, -15, -30, 0);//下鱼身
        context.fill();
        context.save();

        context.beginPath();
        context.translate(40, 0);
        context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);//周期scale来模拟摆尾

        context.moveTo(0, 0);
        context.quadraticCurveTo(5, 10, 20, 8);
        context.quadraticCurveTo(12, 5, 10, 0);
        context.quadraticCurveTo(12, -5, 20, -8);
        context.quadraticCurveTo(5, -10, 0, 0);//鱼尾巴四个部分
        context.fill();
        context.restore();

        context.save();
        //鱼鳍
        context.beginPath();
        context.translate(-3, 0);
        context.rotate(Math.PI / 4 + Math.PI / 10 * Math.sin(this.phi));
        context.moveTo(-5, 0);
        context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
        context.bezierCurveTo(12, -25, 8, -10, 0, 0);

        context.closePath();
        context.fill();
        context.restore();
        context.restore();
        this.updateStatus();
    }
}