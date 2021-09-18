import { Fish } from "./fish";
import { SurfacePoint } from "./SurfacePoint";
export class Renderer {
    /* ----------------------------------- 常量 ----------------------------------- */
    static SURFACE_POINT_INTERVAL = 10;//水面点之间的基础间隔
    static THRESHOLD = 50;//鼠标控制水面的最大范围(y方向)
    /* ----------------------------------- 组件 ----------------------------------- */
    $window: Window;
    $container: HTMLDivElement;
    $canvas: HTMLCanvasElement;
    $context: CanvasRenderingContext2D;
    /* ----------------------------------- 变量 ----------------------------------- */
    width: number;//this.container.width的缓冲
    height: number;
    pointInterval: number;//水面点之间的间隔
    points: SurfacePoint[];
    fishes: Fish[];
    fishCount: number;//根据窗口宽度确定渲染鱼的条数
    addFishIntervalCount = 40;//初始鱼的数目较少 按固定时间间隔添加鱼
    axis: {//水花的轴
        x: number;
        y: number;
    }
    //生命周期方法
    launch() {
        this.setParameters();
        this.lockThis();
        this.bindEvent();
        this.setup();
        this.render();
    }
    setParameters() {
        this.$window = window;
        this.$container = document.getElementById('fish-container') as HTMLDivElement;//三角是强制类型转换
        this.$canvas = document.getElementById('fish-canvas') as HTMLCanvasElement;//类型断言比强制类型转换安全
        this.$context = this.$canvas.getContext('2d');
    }
    lockThis() {
        this.startEpicenter = this.startEpicenter.bind(this);
        this.moveEpicenter = this.moveEpicenter.bind(this);
        this.render = this.render.bind(this);
    }
    bindEvent() {
        this.$container.onmouseenter = this.startEpicenter;
        this.$container.onmousemove = this.moveEpicenter;
    }
    setup() {
        this.points = [];
        this.fishes = [];
        this.width = this.$container.clientWidth;//无padding clientWidth=内容width
        this.height = this.$container.clientHeight;
        this.$canvas.width = this.width;
        this.$canvas.height = this.height;
        this.fishCount = 2 * this.width / 500;
        this.createSurfacePoints();
    }
    render() {
        requestAnimationFrame(this.render);
        this.updateStatus();
        this.$context.clearRect(0, 0, this.width, this.height);
        this.$context.fillStyle = 'hsl(0, 0%, 0%)';
        for (var i = 0, count = this.fishes.length; i < count; i++) {
            this.fishes[i].render(this.$context);
        }
        this.$context.save();
        this.$context.globalCompositeOperation = 'xor';
        this.$context.beginPath();
        this.$context.moveTo(0, this.height);//移动到左下角

        for (let i = 0, count = this.points.length; i < count; i++) {
            this.points[i].render(this.$context);
        }

        this.$context.lineTo(this.width, this.height);
        this.$context.closePath();
        this.$context.fill();
        this.$context.restore();
    }
    getAxis(event) {
        return {//在容器中的相对坐标 坐标系变换 从窗体坐标到容器坐标
            x: event.clientX - this.$container.getBoundingClientRect().left,//offsetTop废弃，此方法兼容性可
            y: event.clientY - this.$container.getBoundingClientRect().top,
        };
    }
    startEpicenter(event) {
        this.axis = this.getAxis(event);
        console.log(this.axis)
        console.log(this.height)
    }
    moveEpicenter(event) {
        var axis = this.getAxis(event);
        if (!this.axis) {
            this.axis = axis;
        }
        //这里计算机计算的时差约为1秒 所以初始鼠标y值-当前鼠标y值=鼠标移动速度
        this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
        this.axis = axis;
    }
    generateEpicenter(x, y, velocity) {
        //THRESHOLD 振幅
        if (y < this.height / 2 - Renderer.THRESHOLD || y > this.height / 2 + Renderer.THRESHOLD) {
            return;
        }
        var index = Math.round(x / this.pointInterval);
        if (index < 0 || index >= this.points.length) {
            return;
        }
        this.points[index].interfere(velocity);
    }

    createSurfacePoints() {
        var count = Math.round(this.width / Renderer.SURFACE_POINT_INTERVAL);
        this.pointInterval = Renderer.SURFACE_POINT_INTERVAL;//波长暂时写死，可以考虑制造大波小波的效果
        this.points.push(new SurfacePoint(this.getSurfaceHeight(), 0));
        for (var i = 1; i < count; i++) {
            console.log(i * this.pointInterval)
            var point = new SurfacePoint(this.getSurfaceHeight(), i * this.pointInterval);
            var leftNode = this.points[i - 1];
            point.linkLeft(leftNode);
            leftNode.linkRight(point);
            this.points.push(point)
        }
    }
    updateStatus() {
        //updateSelf要和updateNeighbor隔离防止震动积累 要在两个循环里写
        for (let i = 0, count = this.points.length; i < count; i++) {
            this.points[i].updateSelf();
        }
        for (let i = 0, count = this.points.length; i < count; i++) {
            this.points[i].updateNeighbors();
        }
        if (this.fishes.length < this.fishCount) {
            if (--this.addFishIntervalCount === 0) {
                this.addFishIntervalCount = 40;
                this.fishes.push(new Fish(this));
            }
        }
    }
    getSurfaceHeight(): number {
        return this.height * 0.5;
    }
}