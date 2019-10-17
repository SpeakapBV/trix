Trix.config.textAttributes =
  bold:
    tagName: "b"
    inheritable: true
    parser: (element) ->
      style = window.getComputedStyle(element)
      (style["fontWeight"] is "bold" or style["fontWeight"] >= 600) and style["fontSize"] is "12px"
  italic:
    tagName: "i"
    inheritable: true
    parser: (element) ->
      style = window.getComputedStyle(element)
      style["fontStyle"] is "italic"
  href:
    groupTagName: "a"
    parser: (element) ->
      {attachmentSelector} = Trix.AttachmentView
      matchingSelector = "a:not(#{attachmentSelector})"
      if link = Trix.findClosestElementFromNode(element, {matchingSelector})
        link.getAttribute("href")
  underline:
    tagName: "u"
    inheritable: true
    parser: (element) ->
      style = window.getComputedStyle(element)
      /underline/.test(style["textDecoration"])
  frozen:
    style: { "backgroundColor": "highlight" }
