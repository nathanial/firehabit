import posed from 'react-pose';
export const Drawer = posed.div({
    visible: {
        height: props => props.height
    },
    hidden: {
        height: 0
    }
})
