#= require trix/models/location_mapper
#= require trix/models/point_mapper
#= require trix/observers/selection_change_observer

# NOTE: A update removed a fix for IE11, if needed it can be found with this commit:
# fix: IE11 fix getting DOM range funcitonality	391a7462	Andrii Maglovanyi <andrii.maglovanyi@gmail.com>	23 Oct 2019 at 11:37 AM

{getDOMSelection, getDOMRange, setDOMRange, defer, elementContainsNode,
 nodeIsCursorTarget, innerElementIsActive, handleEvent, handleEventOnce,
 normalizeRange, rangeIsCollapsed, rangesAreEqual} = Trix

class Trix.SelectionManager extends Trix.BasicObject
  constructor: (@element) ->
    @locationMapper = new Trix.LocationMapper @element
    @pointMapper = new Trix.PointMapper
    @lockCount = 0
    handleEvent("mousedown", onElement: @element, withCallback: @didMouseDown)

  getLocationRange: (options = {}) ->
    locationRange = if options.ignoreLock
      @currentLocationRange
    else
      @lockedLocationRange ? @currentLocationRange

  setLocationRange: (locationRange) ->
    return if @lockedLocationRange
    locationRange = normalizeRange(locationRange)
    if domRange = @createDOMRangeFromLocationRange(locationRange)
      setDOMRange(domRange)
      @updateCurrentLocationRange(locationRange)

  getPointRange: ->
    if domRange = getDOMRange()
      @findPointRangeFromDOMRange(domRange)

  setLocationRangeFromPointRange: (pointRange) ->
    pointRange = normalizeRange(pointRange)
    startLocation = @getLocationAtPoint(pointRange[0])
    endLocation = @getLocationAtPoint(pointRange[1])
    @setLocationRange([startLocation, endLocation])

  getClientRectAtLocationRange: (locationRange) ->
    if domRange = @createDOMRangeFromLocationRange(locationRange)
      @getClientRectsForDOMRange(domRange)[1]

  locationIsCursorTarget: (location) ->
    [node, offset] = @findNodeAndOffsetFromLocation(location)
    nodeIsCursorTarget(node)

  lock: ->
    if @lockCount++ is 0
      @updateCurrentLocationRange()
      @lockedLocationRange = @getLocationRange()

  unlock: ->
    if --@lockCount is 0
      lockedLocationRange = @lockedLocationRange
      @lockedLocationRange = null
      @setLocationRange(lockedLocationRange) if lockedLocationRange?

  clearSelection: ->
    getDOMSelection()?.removeAllRanges()

  selectionIsCollapsed: ->
    getDOMRange()?.collapsed is true

  selectionIsExpanded: ->
    not @selectionIsCollapsed()

  # Private

  @proxyMethod "locationMapper.findLocationFromContainerAndOffset"
  @proxyMethod "locationMapper.findContainerAndOffsetFromLocation"
  @proxyMethod "locationMapper.findNodeAndOffsetFromLocation"
  @proxyMethod "pointMapper.findPointRangeFromDOMRange"
  @proxyMethod "pointMapper.createDOMRangeFromPoint"
  @proxyMethod "pointMapper.getClientRectsForDOMRange"

  didMouseDown: =>
    @pauseTemporarily()

  pauseTemporarily: ->
    @paused = true

    resume = =>
      @paused = false
      clearTimeout(resumeTimeout)
      for handler in resumeHandlers
        handler.destroy()
      if elementContainsNode(document, @element)
        @selectionDidChange()

    resumeTimeout = setTimeout(resume, 200)
    resumeHandlers = for eventName in ["mousemove", "keydown"]
      handleEvent(eventName, onElement: document, withCallback: resume)

  selectionDidChange: =>
    unless @paused or innerElementIsActive(@element)
      @updateCurrentLocationRange()

  updateCurrentLocationRange: (locationRange) ->
    locationRange ?= @createLocationRangeFromDOMRange(getDOMRange())
    if not rangesAreEqual(locationRange, @currentLocationRange)
      @currentLocationRange = locationRange
      @delegate?.locationRangeDidChange?(@currentLocationRange?.slice(0))

  createDOMRangeFromLocationRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetFromLocation(locationRange[0])
    rangeEnd = if rangeIsCollapsed(locationRange)
      rangeStart
    else
      @findContainerAndOffsetFromLocation(locationRange[1]) ? rangeStart

    if rangeStart? and rangeEnd?
      domRange = document.createRange()
      domRange.setStart(rangeStart...)
      domRange.setEnd(rangeEnd...)
      domRange

  createLocationRangeFromDOMRange: (domRange) ->
    return unless domRange? and @domRangeWithinElement(domRange)
    return unless start = @findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset)
    end = @findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset) unless domRange.collapsed
    normalizeRange([start, end])

  getLocationAtPoint: (point) ->
    if domRange = @createDOMRangeFromPoint(point)
      @createLocationRangeFromDOMRange(domRange)?[0]

  domRangeWithinElement: (domRange) ->
    if domRange.collapsed
      elementContainsNode(@element, domRange.startContainer)
    else
      elementContainsNode(@element, domRange.startContainer) and elementContainsNode(@element, domRange.endContainer)
