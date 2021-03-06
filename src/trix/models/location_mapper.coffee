{elementContainsNode, findChildIndexOfNode, findClosestElementFromNode,
 findNodeFromContainerAndOffset, nodeIsBlockStartComment, nodeIsBlockContainer,
 nodeIsCursorTarget, nodeIsEmptyTextNode, nodeIsTextNode, nodeIsAttachmentWrapper,
 tagName, walkTree} = Trix

class Trix.LocationMapper
  constructor: (@element) ->

  findLocationFromContainerAndOffset: (container, offset) ->
    childIndex = 0
    foundBlock = false
    location = index: 0, offset: 0

    walker = walkTree(@element, usingFilter: rejectAttachmentContents)

    while walker.nextNode()
      node = walker.currentNode

      if nodeIsAttachmentWrapper(node)
        location.index++ if foundBlock
        location.offset = offset
        break if node is container or node.firstElementChild is container
        foundBlock = true

      else if node is container and nodeIsTextNode(container)
        unless nodeIsCursorTarget(node)
          location.offset += offset
        break

      else
        if node.parentNode is container
          break if childIndex++ is offset
        else unless elementContainsNode(container, node)
          break if childIndex > 0

        if nodeIsBlockStartComment(node)
          location.index++ if foundBlock
          location.offset = 0
          foundBlock = true
        else
          location.offset += nodeLength(node)

    location

  findContainerAndOffsetFromLocation: (location) ->
    if location.index is 0 and location.offset is 0
      container = @element
      offset = 0

      while container.firstChild
        container = container.firstChild
        if nodeIsAttachmentWrapper(container)
          container = container.firstElementChild
          break
        if nodeIsBlockContainer(container)
          offset = 1
          break

      return [container, offset]

    [node, nodeOffset] = @findNodeAndOffsetFromLocation(location)
    return unless node

    if nodeIsAttachmentWrapper(node)
      container = node.firstElementChild
      offset = location.offset

    else if nodeIsTextNode(node)
      container = node
      string = node.textContent
      offset = location.offset - nodeOffset

    else
      container = node.parentNode

      unless nodeIsBlockContainer(container)
        while node is container.lastChild
          node = container
          container = container.parentNode
          break if nodeIsBlockContainer(container)

      offset = findChildIndexOfNode(node)
      offset++ unless location.offset is 0

    [container, offset]

  findNodeAndOffsetFromLocation: (location) ->
    offset = 0

    for currentNode in @getSignificantNodesForIndex(location.index)
      length = nodeLength(currentNode)

      if location.offset <= offset + length
        if nodeIsAttachmentWrapper(currentNode)
          node = currentNode
          nodeOffset = offset
          break if location.offset is nodeOffset

        if nodeIsTextNode(currentNode)
          node = currentNode
          nodeOffset = offset
          break if location.offset is nodeOffset and nodeIsCursorTarget(node)

        else if not node
          node = currentNode
          nodeOffset = offset

      offset += length
      break if offset > location.offset

    [node, nodeOffset]

  # Private

  getSignificantNodesForIndex: (index) ->
    nodes = []
    walker = walkTree(@element, usingFilter: acceptSignificantNodes)
    recordingNodes = false

    while walker.nextNode()
      node = walker.currentNode
      if nodeIsBlockStartComment(node) or nodeIsAttachmentWrapper(node)
        if blockIndex?
          blockIndex++
        else
          blockIndex = 0

        if blockIndex is index
          if nodeIsAttachmentWrapper(node)
            nodes.push(node)
          else
            recordingNodes = true
        else if recordingNodes
          break
      else if recordingNodes
        nodes.push(node)

    nodes

  nodeLength = (node) ->
    if node.nodeType is Node.TEXT_NODE
      if nodeIsCursorTarget(node)
        0
      else
        string = node.textContent
        string.length
    else if tagName(node) is "br" or nodeIsAttachmentWrapper(node)
      1
    else
      0

  acceptSignificantNodes = (node) ->
    if rejectEmptyTextNodes(node) is NodeFilter.FILTER_ACCEPT
      rejectAttachmentContents(node)
    else
      NodeFilter.FILTER_REJECT

  rejectEmptyTextNodes = (node) ->
    if nodeIsEmptyTextNode(node)
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

  rejectAttachmentContents = (node) ->
    if nodeIsAttachmentWrapper(node.parentNode)
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT
