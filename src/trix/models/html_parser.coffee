{arraysAreEqual, normalizeSpaces, makeElement, tagName, walkTree,
 findClosestElementFromNode, elementContainsNode, nodeIsAttachmentWrapper, extend} = Trix

class Trix.HTMLParser extends Trix.BasicObject
  allowedAttributes = "style width height class target data-eid data-href data-mime-type data-rel".split(" ")
  allowedProtocols = "http https".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html, {@referenceElement} = {}) ->
    @blocks = []
    @blockElements = []
    @processedElements = []

  getDocument: ->
    Trix.Document.fromJSON(@blocks)

  parse: ->
    try
      @createHiddenContainer()
      html = sanitizeHTML(@html)
      @containerElement.innerHTML = html
      walker = walkTree(@containerElement, usingFilter: nodeFilter)
      @processNode(walker.currentNode) while walker.nextNode()
      @translateBlockElementMarginsToNewlines()
    finally
      @removeHiddenContainer()

  nodeFilter = (node) ->
    if tagName(node) is "style"
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

  createHiddenContainer: ->
    if @referenceElement
      @containerElement = @referenceElement.cloneNode(false)
      @containerElement.removeAttribute("id")
      @containerElement.setAttribute("data-trix-internal", "")
      @containerElement.style.display = "none"
      @referenceElement.parentNode.insertBefore(@containerElement, @referenceElement.nextSibling)
    else
      @containerElement = makeElement(tagName: "div", style: { display: "none" })
      document.body.appendChild(@containerElement)

  removeHiddenContainer: ->
    @containerElement.parentNode.removeChild(@containerElement)

  processNode: (node) ->
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        if not nodeIsAttachmentWrapper(node)
          @appendBlockForElement(node)
        @processElement(node)

  appendBlockForElement: (element) ->
    if @isBlockElement(element) and not @isBlockElement(element.firstChild)
      attributes = @getBlockAttributes(element)
      unless elementContainsNode(@currentBlockElement, element) and arraysAreEqual(attributes, @currentBlock.attributes)
        @currentBlock = @appendBlockForAttributesWithElement(attributes, element)
        @currentBlockElement = element

    else if @currentBlockElement and not elementContainsNode(@currentBlockElement, element) and not @isBlockElement(element)
      if parentBlockElement = @findParentBlockElement(element)
        @appendBlockForElement(parentBlockElement)
      else
        @currentBlock = @appendEmptyBlock()
        @currentBlockElement = null

  findParentBlockElement: (element) ->
    {parentElement} = element
    while parentElement and parentElement isnt @containerElement
      if @isBlockElement(parentElement) and parentElement in @blockElements
        return parentElement
      else
        {parentElement} = parentElement
    null

  isExtraBR: (element) ->
    tagName(element) is "br" and
      @isBlockElement(element.parentNode) and
      element.parentNode.lastChild is element

  isBlockElement: (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if findClosestElementFromNode(element, matchingSelector: "td")
    tagName(element) in @getBlockTagNames() or window.getComputedStyle(element).display is "block"

  getBlockTagNames: ->
    @blockTagNames ?= (value.tagName for key, value of Trix.config.blockAttributes)

  processTextNode: (node) ->
    if string = normalizeSpaces(node.data)
      @appendStringWithAttributes(string, @getTextAttributes(node.parentNode))

  processElement: (element) ->
    if nodeIsAttachmentWrapper(element)
      attributes = getAttachmentAttributes(element)
      @appendAttachmentForAttributesWithElement(attributes, element)
      # We have everything we need so avoid processing inner nodes
      element.innerHTML = ""
      @processedElements.push(element)
    else
      switch tagName(element)
        when "br"
          unless @isExtraBR(element) or @isBlockElement(element.nextSibling)
            @appendStringWithAttributes("\n", @getTextAttributes(element))
          @processedElements.push(element)
        when "tr"
          unless element.parentNode.firstChild is element
            @appendStringWithAttributes("\n")
        when "td"
          unless element.parentNode.firstChild is element
            @appendStringWithAttributes(" | ")

  appendBlockForAttributesWithElement: (attributes, element) ->
    @blockElements.push(element)
    block = blockForAttributes(attributes)
    @blocks.push(block)
    block

  appendEmptyBlock: ->
    @appendBlockForAttributesWithElement([], null)

  appendStringWithAttributes: (string, attributes) ->
    @appendPiece(pieceForString(string, attributes))

  appendAttachmentForAttributesWithElement: (attachment, element) ->
    @blockElements.push(element)
    block = blockForAttachment(attachment)
    @blocks.push(block)
    block

  appendPiece: (piece) ->
    if @blocks.length is 0
      @appendEmptyBlock()
    @blocks[@blocks.length - 1].text.push(piece)

  appendStringToTextAtIndex: (string, index) ->
    {text} = @blocks[index]
    piece = text[text.length - 1]

    if piece?.type is "string"
      piece.string += string
    else
      text.push(pieceForString(string))

  prependStringToTextAtIndex: (string, index) ->
    {text} = @blocks[index]
    piece = text[0]

    if piece?.type is "string"
      piece.string = string + piece.string
    else
      text.unshift(pieceForString(string))

  getTextAttributes: (element) ->
    attributes = {}
    for attribute, config of Trix.config.textAttributes
      if config.parser
        if value = config.parser(element)
          attributes[attribute] = value
      else if config.tagName
        if tagName(element) is config.tagName
          attributes[attribute] = true

    if nodeIsAttachmentWrapper(element)
      if json = element.firstElementChild.dataset.trixAttributes
        for key, value of JSON.parse(json)
          attributes[key] = value

    attributes

  getBlockAttributes: (element) ->
    attributes = []
    while element and element isnt @containerElement
      for attribute, config of Trix.config.blockAttributes when config.parse isnt false
        if tagName(element) is config.tagName
          if config.test?(element) or not config.test
            attributes.push(attribute)
            attributes.push(config.listAttribute) if config.listAttribute
      element = element.parentNode
    attributes.reverse()

  getMarginOfBlockElementAtIndex: (index) ->
    if element = @blockElements[index]
      unless tagName(element) in @getBlockTagNames() or element in @processedElements
        getBlockElementMargin(element)

  getMarginOfDefaultBlockElement: ->
    element = makeElement(Trix.config.blockAttributes.default.tagName)
    @containerElement.appendChild(element)
    getBlockElementMargin(element)

  translateBlockElementMarginsToNewlines: ->
    defaultMargin = @getMarginOfDefaultBlockElement()

    for block, index in @blocks when margin = @getMarginOfBlockElementAtIndex(index)
      if margin.top > defaultMargin.top * 2
        @prependStringToTextAtIndex("\n", index)

      if margin.bottom > defaultMargin.bottom * 2
        @appendStringToTextAtIndex("\n", index)

  pieceForString = (string, attributes = {}) ->
    type = "string"
    {string, attributes, type}

  blockForAttributes = (attributes = {}) ->
    text = []
    {text, attributes}

  blockForAttachment = (attachment, attributes = {}) ->
    text = []
    {text, attributes, attachment}

  getAttachmentAttributes = (element) ->
    shareItem = element.firstElementChild
    isImage = shareItem.classList.contains("image")
    {
      contentType: shareItem.getAttribute("data-mime-type"),
      eid: shareItem.getAttribute("data-eid"),
      filename: if isImage then "" else shareItem.querySelector("a").textContent
      previewable: isImage,
      url: if isImage
        shareItem.querySelector("img").getAttribute("src")
      else
        a = shareItem.querySelector("a")
        a.getAttribute("data-href") or a.getAttribute("href")
    }

  sanitizeHTML = (html) ->
    html = removeInsignificantWhitespace(html)
    doc = document.implementation.createHTMLDocument("")
    doc.documentElement.innerHTML = html
    {body, head} = doc

    for style in head.querySelectorAll("style")
      body.appendChild(style)

    nodesToRemove = []
    walker = walkTree(body)

    while walker.nextNode()
      node = walker.currentNode
      switch node.nodeType
        when Node.ELEMENT_NODE
          element = node
          for {name, value} in [element.attributes...]
            unless isAllowedAttribute(name, value)
              element.removeAttribute(name)
        when Node.COMMENT_NODE
          nodesToRemove.push(node)
        when Node.TEXT_NODE
          if node.data.match(/^\s*$/) and node.parentNode is body
            nodesToRemove.push(node)

    for node in nodesToRemove
      node.parentNode.removeChild(node)

    body.innerHTML

  removeInsignificantWhitespace = (html) ->
    html
      .replace(/>\n+</g, "><")
      .replace(/>\ +</g, "> <")

  isAllowedAttribute = (name, value) ->
    if name is "href" or name is "src"
      for protocol in allowedProtocols
        return true if value.indexOf(protocol + ":") is 0

    return true if name.indexOf("data-trix") is 0

    return name in allowedAttributes

  getBlockElementMargin = (element) ->
    style = window.getComputedStyle(element)
    if style.display is "block"
      top: parseInt(style.marginTop), bottom: parseInt(style.marginBottom)

  getImageDimensions = (element) ->
    width = element.getAttribute("width")
    height = element.getAttribute("height")
    dimensions = {}
    dimensions.width = parseInt(width, 10) if width
    dimensions.height = parseInt(height, 10) if height
    dimensions
