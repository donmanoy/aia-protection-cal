
function AppleSlider(slider, onchanged)
{
}

/*
 * init() member function
 * Initialize the slider.
 * You do not need to call this directly, it will be called when necessary.
 * You probably want to be calling refresh().
 * pre: this.slider
 * post: this._thumb, this._track + event handlers
 */
AppleSlider.prototype._init = function()
{
	// For JavaScript event handlers
	var _self = this;
	
	this._captureEventHandler = function(event) { _self._captureEvent(event); };
	this._mousedownThumbHandler = function(event) { _self._mousedownThumb(event); };
	this._mousemoveThumbHandler = function(event) { _self._mousemoveThumb(event); };
	this._mouseupThumbHandler = function(event) { _self._mouseupThumb(event); };
	this._mousedownTrackHandler = function(event) { _self._mousedownTrack(event); };
	
	var style = null;
	var element = null;
	
	// Slider Track
	this._track = document.createElement("div");
	style = this._track.style;
	// fill our containing div
	style.height = "100%";
	style.width = "100%";
	this.slider.appendChild(this._track);
	
	// Slider Track Left
	element = document.createElement("div");
	element.style.position = "absolute";
	this._setObjectStart(element, 0);
	this._track.appendChild(element);
	
	// Slider Track Middle
	element = document.createElement("div");
	element.style.position = "absolute";
	this._track.appendChild(element);
	
	// Slider Track Right
	element = document.createElement("div");
	element.style.position = "absolute";
	this._setObjectEnd(element, 0);
	this._track.appendChild(element);
	
	// Slider Thumb
	this._thumb = document.createElement("div");
	style = this._thumb.style;
	style.position = "absolute";
	this._track.appendChild(this._thumb);
	
	this.setSize(this.size);
	this.setTrackStart(this.trackStartPath, this.trackStartLength);
	this.setTrackMiddle(this.trackMiddlePath);
	this.setTrackEnd(this.trackEndPath, this.trackEndLength);
	this.setThumb(this.thumbPath, this.thumbLength);
	
	this.slider.style.appleDashboardRegion = "dashboard-region(control rectangle)";
	
	// Add event listeners
	this._track.addEventListener("mousedown", this._mousedownTrackHandler, true);
	//this._thumb.addEventListener("mousedown", this._mousedownThumbHandler, true);
    this._thumb.addEventListener("mousedown", this._mousedownThumbHandler, true);
	
	this.refresh();
}

AppleSlider.prototype.remove = function()
{
	var parent = this._track.parentNode;
	parent.removeChild(this._track);
}

/*
 * refresh() member function
 * Refresh the current slider position and size.
 * Call this to make the slider appear after the widget has loaded and 
 * the AppleSlider object has been instantiated.
 */
AppleSlider.prototype.refresh = function()
{
	// get the scrollbar offset
	this._trackOffset = this._computeTrackOffset();
	this._sliderLength = this._computeSliderLength();
	
	this._numScrollablePixels = this._sliderLength - this.thumbLength / 2 - (2 * this.padding);
	
	this.slideTo(this._numScrollablePixels * this.value + this.padding);
}

AppleSlider.prototype.slideTo = function(newThumbPos)
{	
	if (newThumbPos < this.padding)
	{
		newThumbPos = this.padding;
	}
	else if (newThumbPos > this._numScrollablePixels)
	{
		newThumbPos = this._numScrollablePixels;
	}
	
	//this.value = (newThumbPos - this.padding) / (this._numScrollablePixels - this.padding);
    this.value = Math.round(newThumbPos / this.stepDistance) + 1;
    newThumbPos = newThumbPos - 10;
	this._setObjectStart(this._thumb, newThumbPos);
	
	if (this.continuous && this.onchanged != null)
		this.onchanged(this.value);
}

// Capture events that we don't handle but also don't want getting through
AppleSlider.prototype._captureEvent = function(event)
{
	event.stopPropagation();
	event.preventDefault();
}

/*********************
 * Thumb scroll events
 */
AppleSlider.prototype._mousedownThumb = function(event)
{
    //alert("thumb down");
	// temporary event listeners
	/*document.addEventListener("mousemove", this._mousemoveThumbHandler, true);
	document.addEventListener("mouseup", this._mouseupThumbHandler, true);
	document.addEventListener("mouseover", this._captureEventHandler, true);
	document.addEventListener("mouseout", this._captureEventHandler, true);
	*/
    document.addEventListener("mousemove", this._mousemoveThumbHandler, true);
	document.addEventListener("mouseup", this._mouseupThumbHandler, true);
	document.addEventListener("mouseover", this._captureEventHandler, true);
	document.addEventListener("mouseout", this._captureEventHandler, true);
	this._thumbStartTemp = this._getMousePosition(event);
	
	this._sliderThumbStartPos = this._getThumbStartPos();

	event.stopPropagation();
	event.preventDefault();
}

AppleSlider.prototype._mousemoveThumb = function(event)
{
    //alert("thumb moved");   
	var delta = this._getMousePosition(event) - this._thumbStartTemp
	
	var new_pos = this._sliderThumbStartPos + delta;
	this.slideTo(new_pos);
	
	event.stopPropagation();
	event.preventDefault();
}

AppleSlider.prototype._mouseupThumb = function(event)
{
	//alert("thumb up");
    document.removeEventListener("mousemove", this._mousemoveThumbHandler, true);
	document.removeEventListener("mouseup", this._mouseupThumbHandler, true);
	document.removeEventListener("mouseover", this._captureEventHandler, true);
	document.removeEventListener("mouseout", this._captureEventHandler, true);
	
    // reset the starting position
	delete this._thumbStartTemp;
	delete this._sliderThumbStartPos;
	
	event.stopPropagation();
	event.preventDefault();
	
	// Fire our onchanged event now if they have discontinuous event firing
	if (!this.continuous && this.onchanged != null)
		this.onchanged(this.value);
}

/*********************
 * Track scroll events
 */
AppleSlider.prototype._mousedownTrack = function(event)
{
	this._thumbStartTemp = this._getMousePosition(event);
	this._sliderThumbStartPos = this._getMousePosition(event) - this._trackOffset - (this.thumbLength / 2);
	// temporary event listeners
	document.addEventListener("mousemove", this._mousemoveThumbHandler, true);
	document.addEventListener("mouseup", this._mouseupThumbHandler, true);
	document.addEventListener("mouseover", this._captureEventHandler, true);
	document.addEventListener("mouseout", this._captureEventHandler, true);
	
	this.slideTo(this._sliderThumbStartPos);
} 

AppleSlider.prototype.setStepDistance = function(stepDis)
{
    this.stepDistance = stepDis;
}

AppleSlider.prototype.setSize = function(size)
{
	this.size = size;
	
	this._setObjectSize(this.slider, size);
	this._setObjectSize(this._track.children[1], size);
	this._setObjectSize(this._thumb, size);
}

AppleSlider.prototype.setTrackStart = function(imgpath, length)
{
	this.trackStartPath = imgpath;
	this.trackStartLength = length;
	
	var element = this._track.children[0];
	element.style.background = "url(" + imgpath + ") no-repeat top left";
	this._setObjectLength(element, length);
	this._setObjectSize(element, this.size);
	this._setObjectStart(this._track.children[1], length);
}

AppleSlider.prototype.setTrackMiddle = function(imgpath)
{
	this.trackMiddlePath = imgpath;
	
	this._track.children[1].style.background = "url(" + imgpath + ") " + this._repeatType + " top left";
    this._track.children[1].style.height = "90px";
    this._track.children[1].style.margin = "25px 0px 0px 0px";
    //this._track.children[1].style.width = "72px";
}

AppleSlider.prototype.setTrackEnd = function(imgpath, length)
{
	this.trackEndPath = imgpath;
	this.trackEndLength = length;
	
	var element = this._track.children[2];
	element.style.background = "url(" + imgpath + ") no-repeat top left";
	this._setObjectLength(element, length);
	this._setObjectSize(element, this.size);
	this._setObjectEnd(this._track.children[1], length);
}

AppleSlider.prototype.setThumb = function(imgpath, length)
{
	this.thumbPath = imgpath;
	this.thumbLength = length;

	this._thumb.style.background = "url(" + imgpath + ") no-repeat top left";
    this._thumb.style.width = "72px";
    this._thumb.style.height = "90px";
	this._setObjectLength(this._thumb, length);
}

AppleSlider.prototype.getThumb = function() {
    return this._thumb;
}

AppleSlider.prototype.setValue = function(newvalue)
{
	this.slideTo(this._numScrollablePixels * newvalue + this.padding);
}

/*******************************************************************************
* AppleHorizontalSlider
* Implementation of AppleSlider
*
*
*/

function AppleHorizontalSlider(slider, onchanged)
{
	/* Objects */
	this.slider = slider;
	
	/* public properties */
	// These are read-write. Set them as needed.
	this.onchanged = onchanged;
	this.continuous = true; // Fire onchanged live, as opposed to onmouseup
	this.padding = 0;
	
	// These are read-only. Use the setter functions to set them.
	this.value = 0.0;
	this.size = 22;
	this.trackStartPath = "file:///System/Library/WidgetResources/AppleClasses/Images/slide_track_hleft.png";
	this.trackStartLength = 0;
	this.trackMiddlePath = "file:///System/Library/WidgetResources/AppleClasses/Images/slide_track_hmid.png";
	this.trackEndPath = "file:///System/Library/WidgetResources/AppleClasses/Images/slide_track_hright.png";
	this.trackEndLength = 0;
	this.thumbPath = "Images/handle~ipad.png";
	this.thumbLength = 72;
	
	/* Internal objects */
	this._track = null;
	this._thumb = null;
	
	/* Dimensions */
	// these only need to be set during refresh()
	this._trackOffset = 0;
	this._sliderLength = 0;
	this._numScrollablePixels = 0;
	this._repeatType = "no-repeat";//"repeat-x";
	
	this._init();
}

// Inherit from AppleSlider
AppleHorizontalSlider.prototype = new AppleSlider(null);

/*********************
 * Orientation-specific functions.
 * These helper functions return vertical values.
 */
AppleHorizontalSlider.prototype._computeTrackOffset = function()
{
	// get the absolute left of the track
	var obj = this.slider;
	var curtop = 0;
	while (obj.offsetParent)
	{
		curtop += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	
	return curtop;
}

AppleHorizontalSlider.prototype._computeSliderLength = function()
{
	// get the current actual slider length
	var style = document.defaultView.getComputedStyle(this.slider, '');
	return style ? parseInt(style.getPropertyValue("width"), 10) : 0;
}

AppleHorizontalSlider.prototype._setObjectSize = function(object, size)
{ object.style.height = size + "px"; }

AppleHorizontalSlider.prototype._setObjectLength = function(object, length)
{ object.style.width = length + "px"; }

AppleHorizontalSlider.prototype._setObjectStart = function(object, start)
{ object.style.left = start + "px"; }

AppleHorizontalSlider.prototype._setObjectEnd = function(object, end)
{ object.style.right = end + "px"; }

AppleHorizontalSlider.prototype._getMousePosition = function(event)
{
	if (event != undefined)
		return event.x;
	else
		return 0;
}

AppleHorizontalSlider.prototype._getThumbStartPos = function()
{
	return parseInt(document.defaultView.getComputedStyle(this._thumb, '').getPropertyValue("left"), 10);
}

