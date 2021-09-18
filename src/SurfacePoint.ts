
/**
 * 水面本质不是连续的是离散的，通过lineTo和fill使得动画连续
 */
export class SurfacePoint {
    /*---------------常量----------------*/
    static SCALE_FACTOR = 0.01;//缩放倍数，调整dHeight数量级
    static SPRING_PROPORTION = 0.005//每帧上升/下降的比例 乘以六十为每秒上升/下降的比例
    static SPRING_FRICTION = 0.8//惩罚项 使dHeight呈收敛的等比数列 模拟能量守恒 否则添加邻居节点的影响时震动会累加
    static INFLUENCE_PROPORTION = 0.3//每帧邻居节点被当前节点带动上升/下降的百分比
    /*---------------变量----------------*/
    initHeight: number;
    height: number;
    dHeight: number;//高度变化量
    x: number
    influence: {
        left: number;
        right: number;
    }
    leftNode: SurfacePoint
    rightNode: SurfacePoint
    /*---------------方法----------------*/
    constructor(height: number, x: number) {
        this.initHeight = height;
        this.height = this.initHeight;
        this.dHeight = 0;
        this.x = x;
        this.influence = { left: 0, right: 0 };
    }

    getRendererHeight(): number {
        return this.initHeight * 2;
    }
    linkLeft(leftNode: SurfacePoint) {
        this.leftNode = leftNode;
    }
    linkRight(rightNode: SurfacePoint) {
        this.rightNode = rightNode;
    }
    /**
     * 干涉 水波受力瞬间变化
     * @param velocity 鼠标速度
     */
    interfere(velocity: number) {//
        this.dHeight = -1 * this.getRendererHeight() * velocity * SurfacePoint.SCALE_FACTOR
    }
    /**
     * 每帧开始时更新自己的数据
     */
    updateSelf() {
        this.dHeight += SurfacePoint.SPRING_PROPORTION * (this.initHeight - this.height)//朝着initHeight的方向移动
        this.dHeight *= SurfacePoint.SPRING_FRICTION;//如果没有惩罚项，则震动会积累
        this.height += this.dHeight;
    }
    updateNeighbors() {
        if (this.leftNode) {//将波动的范围局限在比较小的范围内 将波动缓冲
            this.influence.left = SurfacePoint.INFLUENCE_PROPORTION * (this.height - this.leftNode.height);
        }//缓冲
        if (this.rightNode) {
            this.influence.right = SurfacePoint.INFLUENCE_PROPORTION * (this.height - this.rightNode.height);
        }
    }
    /**
     * 渲染水面点
     * @param context canvas上下文
     */
    render(context: CanvasRenderingContext2D) {
        if (this.leftNode) {//将波动的范围局限在比较小的范围内 所以渲染时才更新
            this.leftNode.height += this.influence.left;
            this.leftNode.dHeight += this.influence.left;

        }
        if (this.rightNode) {

            this.rightNode.height += this.influence.right;
            this.rightNode.dHeight += this.influence.right;
        }
        context.lineTo(this.x, this.getRendererHeight() - this.height)
    }
}