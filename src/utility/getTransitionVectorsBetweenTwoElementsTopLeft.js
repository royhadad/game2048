//deprecated at the moment

// const getPreviousTransitionVectors = (startElement) => {
//     try {
//         const previousTransform = startElement.style.transform;
//         if (!previousTransform) {
//             return {
//                 xDistance: 0,
//                 yDistance: 0
//             }
//         } else {
//             const afterTranslate = previousTransform.split('translate')[1];
//             const withoutBrackets = afterTranslate.slice(1, afterTranslate.length - 3);
//             const [xWithPx, y] = withoutBrackets.split(', ');
//             const x = xWithPx.slice('0', xWithPx.length - 2);
//             return {
//                 xDistance: parseFloat(x),
//                 yDistance: parseFloat(y)
//             }
//         }
//     }
//     catch (e) {
//         alert(e);
//     }
// }

// export default (startElement, targetElement) => {
//     const startElementRect = startElement.getBoundingClientRect();
//     const targetElementRect = targetElement.getBoundingClientRect();
//     const startX = startElementRect.left;
//     const startY = startElementRect.top;
//     const targetX = targetElementRect.left;
//     const targetY = targetElementRect.top;

//     const transitionVectors = {
//         xDistance: targetX - startX,
//         yDistance: targetY - startY
//     }
//     const previousTransitionVector = getPreviousTransitionVectors(startElement);
//     transitionVectors.xDistance += previousTransitionVector.xDistance;
//     transitionVectors.yDistance += previousTransitionVector.yDistance;

//     return transitionVectors;
// }