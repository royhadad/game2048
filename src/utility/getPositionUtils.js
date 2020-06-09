const getElementTopRelativeToClosesPositionedAncestor = (element, closestPositionedAncestor) => {
    const elementRect = element.getBoundingClientRect();
    const closestPositionedAncestorRect = closestPositionedAncestor.getBoundingClientRect()
    return (elementRect.top - closestPositionedAncestorRect.top);
}

const getElementLeftRelativeToClosesPositionedAncestor = (element, closestPositionedAncestor) => {
    const elementRect = element.getBoundingClientRect();
    const closestPositionedAncestorRect = closestPositionedAncestor.getBoundingClientRect()
    return (elementRect.left - closestPositionedAncestorRect.left);
}

export {
    getElementLeftRelativeToClosesPositionedAncestor,
    getElementTopRelativeToClosesPositionedAncestor
};