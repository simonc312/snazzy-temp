var THEME = require('themes/sample/theme');
var CONTROL = require('mobile/control');
var BUTTONS = require('controls/buttons');
var SLIDERS = require('controls/sliders');

//Styles
var labelStyle = new Style( { top:0, font: "bold 40px", horizontal: 'center', vertical: 'middle', color:"black" } );
var labelStyleLandscape = new Style( { top:0, font: "bold 30px", horizontal: 'center', vertical: 'middle', color:"black" } );
var fieldStyle = new Style({ color: 'black', font: 'bold 24px', horizontal: 'center', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
var fieldHintStyle = new Style({ color: '#aaa', font: '24px', horizontal: 'center', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
var pickTempTextStyle = new Style({font:"bold 30px", color:"red"});
var lineStyle = new Style({left: 0, right:0, top:0, bottom:0, skin:whiteS});
//Skins
var whiteS = new Skin({fill:"white"});
var greyS = new Skin({fill:"grey"});
var nameInputSkin = new Skin({ borders: { left:2, right:2, top:2, bottom:2 }, stroke: 'gray',});
var logoSkin = new Skin({
	width:128,
	height:128,
	texture: new Texture('snazzy_thermo_icon.png')
});
var logoSkinLandscape = new Skin({
	width:64,
	height:64,
	texture: new Texture('snazzy_thermo_icon_small.png')
});
var arrowSkin = new Skin({
	width: 48,
	height: 48,
	texture: new Texture('arrow.png')
});

//Logic for converting temperatures
var TEMP_TYPES = {"C": ["F","fahrenheit"],"F" : ["K","kelvin"],"K":["C","celsius"]};
var CELSIUS_FUNCS = {}; var FARENHEIT_FUNCS = {}; var KELVIN_FUNCS = {};

CELSIUS_FUNCS["fahrenheit"] = function(input){return input * 9/5 + 32};
CELSIUS_FUNCS["kelvin"] = function(input){return input + 273.15};
					
FARENHEIT_FUNCS["celsius"] = function(input){return (input - 32) * 5/9};
FARENHEIT_FUNCS["kelvin"] = function(input){return (input + 459.67) * 5/9}

KELVIN_FUNCS["fahrenheit"] = function(input){return input * 9/5 - 459.67};
KELVIN_FUNCS["celsius"] = function(input){return input - 273.15};

var TEMP_FIND = {"celsius":{func:CELSIUS_FUNCS,"minValue":-273,"maxValue":100}, 
				 "fahrenheit":{func:FARENHEIT_FUNCS,"minValue":-459,"maxValue":212},
				 "kelvin":{func:KELVIN_FUNCS,"minValue":0,"maxValue":373}
				 }
var convert = function(inputType,outputType,input){
	if(inputType == outputType)
		return input;
	return Math.round(TEMP_FIND[inputType].func[outputType](Number(input)) * 100) / 100;
}
var getValue = function(inputType,minOrMax){
	return TEMP_FIND[inputType][minOrMax];
}
var toggleTemperatureScale = function(type){
	return TEMP_TYPES[type];
}

//Components
			
var myField = Container.template(function($) { return { 
	width: 250, height: 50, top: 4, left:4, right: 4, skin: nameInputSkin, contents: [
		Scroller($, { 
			left: 4, right: 4, top: 4, bottom: 4, active: false, name: "inputScroller",
			behavior: Object.create(CONTROL.FieldScrollerBehavior.prototype,{
			 	onCreate: { value : function(container, data) {
		            this.data = data;
		            var self = this;
		            
		        }}}), clip: true, contents: [
				Label($, { 
					left: 4, top: 4, bottom: 4, skin: THEME.fieldLabelSkin, style: fieldStyle, 
					editable: true, string: $.name, name: "inputLabel"
				 }),
				 Label($, {
	 			 	style:fieldHintStyle, string:"celsius", name:"inputHint"
				 })
			]
		})
	]
}});

var updateValues = function(value){
				var value = Math.round(value).toString();
				var inputHint = field.inputScroller.inputHint.string;
				var outputHint = outputField.outputScroller.outputHint.string;
				trace("inputHint " + inputHint + "\n");
				trace("value " + value + "\n");
				field.inputScroller.inputLabel.string = value;
				outputField.outputScroller.outputLabel.string = convert(inputHint,outputHint,value);
				field.inputScroller.inputHint.visible = false;
				outputField.outputScroller.outputHint.visible = false;
}

var updateInputValues = function(value){
				var value = (Math.round(value * 100) / 100).toString();
				var inputHint = field.inputScroller.inputHint.string;
				var outputHint = outputField.outputScroller.outputHint.string;
				trace("inputHint " + inputHint + "\n");
				trace("value " + value + "\n");
				field.inputScroller.inputLabel.string = convert(outputHint,inputHint,value);
				field.inputScroller.inputHint.visible = false;
				outputField.outputScroller.outputHint.visible = false;
}

var buttonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}
buttonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(button){
		var newScaleArray = toggleTemperatureScale(button.first.string);
		var inputString = field.inputScroller.inputLabel.string;
		var outputString = outputField.outputScroller.outputLabel.string;
		button.first.string = newScaleArray[0];
		if(button === inputTempButton){
			field.inputScroller.inputHint.string = newScaleArray[1];
			var minValue = getValue(newScaleArray[1],"minValue");
			var maxValue = getValue(newScaleArray[1],"maxValue");
			minValueLabel.string = minValue.toString();
			maxValueLabel.string = maxValue.toString();
			slider.behavior.setMin(minValue);
			slider.behavior.setMax(maxValue);
			var newValue = (minValue + maxValue)/2;
			if(inputString.length > 0){
				trace('inside here');
				newValue = outputString;
				updateInputValues(Number(newValue));
				newValue = field.inputScroller.inputLabel.string;
			}
			slider.behavior.initialState = true;
			slider.behavior.setValue(newValue);
			slider.behavior.initialState = false;
		}
		else if(button === outputTempButton){
			outputField.outputScroller.outputHint.string = newScaleArray[1];
			if(field.inputScroller.inputLabel.string.length > 0)
				updateValues(Number(inputString));
			}
	}}
});

var myButtonTemplate = BUTTONS.Button.template(function($){ return{
	height:30, top:4, bottom:4, left:4, right:4,
	contents:[
		new Label({skin: new Skin({fill: "black"}), left:0, right:0, height:30, width: 20, string:$.textForLabel, style: pickTempTextStyle})
	],
	behavior: new buttonBehavior
}});

var mySlider = SLIDERS.HorizontalSlider.template(function($){ return{
	height:50, top:4, left:50, right:50, bottom:50,
	behavior: Object.create(SLIDERS.HorizontalSliderBehavior.prototype, {
	 onCreate: { value : function(container, data) {
            this.data = data;
            var self = this;
            this.initialState = true;
            this.setMin = function(newMin){self.data.min = newMin};
            this.setMax = function(newMax){self.data.max = newMax};
        }},
		onValueChanged: { value: function(slider){
			SLIDERS.HorizontalSliderBehavior.prototype.onValueChanged.call(this, slider);
			if(this.initialState)
				this.initialState = false;
			else
				updateValues(this.data.value);
	}}})
}});

//Instantiation of Components
var logo = new Content({left:0, right:0, top:0, bottom:0, skin: logoSkin});
var header = new Label({left:0, right:0, top:10, bottom: 4, height: 40, string: "Snazzy Temp", style: labelStyle, name: "header"});
var field = new myField({ name: "" });
var outputField = new myField({ name: "" });
outputField.first.name = "outputScroller";
outputField.first.first.name = "outputLabel";
outputField.first[1].name = "outputHint";
outputField.first[1].string = "fahrenheit";
var inputTempButton = new myButtonTemplate({name:"inputScale",textForLabel:"C"});
var outputTempButton = new myButtonTemplate({name:"outputScale",textForLabel:"F"});
var toLabel = new Label({height: 40,top: 0, bottom: 8, string:"to"});
var arrowImage = new Content({left:0, right:0, top:0, bottom:0, skin: arrowSkin});
var slider = new mySlider({min:-273, max:100, value:-86.5, name: "slider"});
var minValueLabel = new Label({left: 10, top:4, bottom: 50, string:"-273",name:"minValue"});
var maxValueLabel = new Label({right: 10, top:4, bottom: 50, string:"100",name:"maxValue"});

var main = new Column({
	left:0, right:0, top:0, bottom:0,
	skin: whiteS,
	contents:[
		new Line({left: 0, right:0, top:0, bottom:0, name: "logoLine",
			contents:[
				logo
			]}),
		new Line({left: 0, right:0, top:0, bottom:0,name: "headerLine",
			contents:[
				header
			]}),
		new Line({left: 0, right:0, top:0, bottom:0,name: "pickerLine",
			contents:[
				inputTempButton,arrowImage,outputTempButton
			]}),
		new Line({left: 0, right:0, top:0, bottom:0, name: "mainLine",
			contents:[
				field, toLabel,outputField 
			]}),
		new Line({ left: 0, right:0, top:0, bottom:0,name: "sliderLine",
			contents: [
				minValueLabel,
				slider,
				maxValueLabel
			]})
	]
});

application.add(main);
//Responsive to Landscape mode
application.behavior = {
	onAdapt: function(application) {
		if(application.width > application.height){
			header.style = labelStyleLandscape;
			logo.skin = logoSkinLandscape;
			trace("Landscape");
			}
		else{
			header.style = labelStyle;
			logo.skin = logoSkin;
		}
	}
}