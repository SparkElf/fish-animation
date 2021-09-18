// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import jsx from 'acorn-jsx';
export default {
    input: 'src/fish-animation.tsx',
    output: {
        dir: 'build',
        format: 'esm'
    },
    acornInjectPlugins: [jsx()],
    plugins: [typescript({ jsx: 'preserve' })]
};