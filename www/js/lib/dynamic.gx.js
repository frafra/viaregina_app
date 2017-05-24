//newly added to support xls file - begin
var X = XLSX;

var SHEET_NAMES = ["survey", "choices", "settings"];
var TYPES = [];


TYPES["TYPE"] = (function () {
    return new Row();
});
TYPES["INTEGER"] = (function () {
    return new Integer();
});
TYPES["DECIMAL"] = (function () {
    return new Decimal();
});
TYPES["TEXT"] = (function () {
    return new Text();
});
TYPES["SELECT_ONE"] = (function () {
    return new Select_one();
});
TYPES["SELECT_MULTIPLE"] = (function () {
    return new Select_multi();
});
TYPES["NOTE"] = (function () {
    return new Note();
});
TYPES["GEOPOINT"] = (function () {
    return new GeoPoint();
});
TYPES["DATE"] = (function () {
    return new MyDate();
});
TYPES["TIME"] = (function () {
    return new MyTime();
});
TYPES["DATETIME"] = (function () {
    return new Row();
});
TYPES["IMAGE"] = (function () {
    return new Image();
});
TYPES["AUDIO"] = (function () {
    return new Audio();
});
TYPES["VIDEO"] = (function () {
    return new Video();
});
TYPES["BARCODE"] = (function () {
    return new Row();
});
TYPES["BEGIN REPEAT"] = (function () {
    return new BeginRepeat();
});
TYPES["END REPEAT"] = (function () {
    return new EndRepeat();
});
TYPES["START"] = (function () {
    return new Start();
});
TYPES["END"] = (function () {
    return new End();
});
TYPES["PHONENUMBER"] = (function () {
    return new PhoneNumber();
});
TYPES["SIMSERIAL"] = (function () {
    return new SimSerial();
});
TYPES["DEVICEID"] = (function () {
    return new DeviceId();
});
TYPES["TODAY"] = (function () {
    return new Today();
});
TYPES["CALCULATE"] = (function () {
    return new Calculation();
});


var SURVEY_SHEET_COLUMNS = ["type",
    "name",
    "label",
    "hint",
    "constraint",
    "constraintMessage",
    "required",
    "appearance",
    "default",
    "relevant",
    "readOnly",
    "calculation",
    "image",
    "audio",
    "min",
    "max"
];
var CHOICES_SHEET_COLUMNS = ["name", "label", "image"];
var select_one_type = "select_one";
var select_multi_type = "select_multiple";
var formId;
var formTitle;
var defaultLanguage;
var inLoop;
var lastLoopBeginIndex;


var rowList = [];
var endRef; //global variable
var choiceList = [];

function Row() {
    this.hasDrawable = false;
    this.value = '';
}
Row.prototype = {
    constructor: Row,

    setType: function (type) {
        this.type = type;
    },
    setName: function (name) {
        this.name = name;
    },
    setLabel: function (label) {
        this.label = label;
    },
    setHint: function (hint) {
        this.hint = hint;
    },
    setConstraint: function (constraint) {
        this.constraint = constraint;
    },
    setConstraintMessage: function (constraintMessage) {
        this.constraintMessage = constraintMessage;
    },
    setRequired: function (required) {
        this.required = required;
    },
    setAppearance: function (appearance) {
        this.appearance = appearance;
    },
    setDefault: function (_default) {
        this._default = _default;
    },
    setRelevant: function (relevant) {
        this.relevant = relevant;
    },
    setReadOnly: function (readOnly) {
        this.readOnly = readOnly;
    },
    setCalculation: function (calculation) {
        this.calculation = calculation;
    },
    setImage: function (image) {
        this.image = image;
    },
    setAudio: function (audio) {
        this.audio = audio;
    },
    setMin: function (min) {
        this.min = min;
    },
    setMax: function (max) {
        this.max = max;
    },
    gId: function () {
        //to eliminate those characters which can't be set as id
        return this.type.replace(/ /g, "").replace(/[_\W]+/g, "-") + "_" + (this.name == undefined ? '' : this.name.replace(/ /g, "").replace(/[_\W]+/g, "-"));
    },
    getValue: function () {
        return this.value;
    },
    getLabel: function () {
        tmpLabel = this.label;
        for (var hasSign = tmpLabel.indexOf("${"); hasSign >= 0; hasSign = tmpLabel.indexOf("${")) {
            var endSign = tmpLabel.indexOf("}");
            contextVar = tmpLabel.substr(hasSign + 2, endSign - hasSign - 2);
            try {
                actualValue = eval(contextVar);
            } catch (e) {
                actualValue = " n/a ";
            }
            tmpLabel = tmpLabel.replace(("${" + contextVar + "}"), actualValue);
        }
        return tmpLabel;
    },
    rowFromObject: function (obj) { //in row class
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) { //like type , constraint, require, and everything has value , if the properties is not inherited and originality is it's properties , like push o pop , ..
                console.log(prop);
                this[prop] = obj[prop];
            }
        }
    },
    isConstraintVaiolated: function () {
        if (this.constraint != undefined && this.constraint != '') {
            tmpCons = this.constraint;
            tmpCons = tmpCons.replace(/and/g, " && ");
            tmpCons = tmpCons.replace(/or/g, " || ");
            _evalResult = eval(tmpCons);
            return !_evalResult;
        }
        return false;
    },
    exportValue: function () {
        if (!this.isEmpty(this.getValue())) {
            _eval = this.name + " = " + "\"" + this.getValue() + "\"";
            eval(_eval);
        }
    },
    resetValue: function () {
        try {
            //reset when any presented,
            eval(this.name);
            _eval = this.name + " = " + "\'\'";
            eval(_eval);
        } catch (ignore) {

        }
    },
    isRequired: function () {
        return (this.required != undefined && this.required);
    },
    isEmpty: function () {
        return (this.value == undefined || this.value == '');
    },
    chkRequiredAndConstraint: function (reqMsg) {
        this.exportValue();
        if (this.isRequired()) {
            if (this.isEmpty()) {
                alert(reqMsg);
                this.resetValue();
                return false;
            }
        }
        if (this.isConstraintVaiolated()) {
            alert((this.constraintMessage));
            this.resetValue();
            return false;
        }

        return true;
    },
    setChoice: function (choice) {
        this.choice = choice;
    }
};

function PhoneNumber() {
    Row.call(this);
    this.hasDrawable = false;
    this.value = '';
    //only works for android & iOS, for more Info refer to https://www.npmjs.com/package/cordova-plugin-sim ;)
    if (window && window.plugins && window.plugins.sim)
        window.plugins.sim.getSimInfo(function (r) {
            console.log(r);
            this.value = r;
        }, function (r) {
            console.log(r);
            this.value = 'n/a';
        })
}
PhoneNumber.prototype = Object.create(Row.prototype);
PhoneNumber.prototype.constructor = PhoneNumber;
PhoneNumber.prototype.generateHtml = function () {
    console.log("PhoneNumber");
    return;
};
PhoneNumber.prototype.onNext = function () {

};
PhoneNumber.prototype.onBack = function () {

};
PhoneNumber.prototype.prepare = function () {
    return;
};
function SimSerial() {
    Row.call(this);
    this.hasDrawable = false;
    this.value = '';
}
SimSerial.prototype = Object.create(Row.prototype);
SimSerial.prototype.constructor = SimSerial;
SimSerial.prototype.generateHtml = function () {
    console.log("SimSerial");
    return;
};
SimSerial.prototype.onNext = function () {

};
SimSerial.prototype.onBack = function () {

};
SimSerial.prototype.prepare = function () {
    return;
};
function DeviceId() {
    Row.call(this);
    this.hasDrawable = false;
    this.value = device.uuid;
    if (this.value == null)
        this.value = new Fingerprint().get().toString() + "-PC";
}
DeviceId.prototype = Object.create(Row.prototype);
DeviceId.prototype.constructor = DeviceId;
DeviceId.prototype.generateHtml = function () {
    console.log("DeviceId");
    return;
};
DeviceId.prototype.onNext = function () {

};
DeviceId.prototype.onBack = function () {

};
DeviceId.prototype.prepare = function () {
    return;
};
function Today() {
    Row.call(this);
    this.hasDrawable = false;
    this.value = new Date().toISOString();
}
Today.prototype = Object.create(Row.prototype);
Today.prototype.constructor = Today;
Today.prototype.generateHtml = function () {
    console.log("Today");
    return;
};
Today.prototype.onNext = function () {

};
Today.prototype.onBack = function () {

};
Today.prototype.prepare = function () {
    return;
};
function Start() {
    Row.call(this);
    this.hasDrawable = false;
    this.value = new Date().toISOString();
}
Start.prototype = Object.create(Row.prototype);
Start.prototype.constructor = Start;
Start.prototype.generateHtml = function () {
    console.log("Start");
    return;
};
Start.prototype.onNext = function () {

};
Start.prototype.onBack = function () {

};
Start.prototype.prepare = function () {
    return;
};
function End() {
    Row.call(this);
    this.hasDrawable = false;
}
End.prototype = Object.create(Row.prototype);
End.prototype.constructor = End;
End.prototype.doInternal = function (i) {
    endRef = this;
    return true;
};
End.prototype.onNext = function () {

};
End.prototype.onBack = function () {

};
End.prototype.prepare = function () {
    return;
};
End.prototype.end = function () {
    this.value = new Date().toISOString();
};
function BeginRepeat() {
    Row.call(this);
    this.hasDrawable = true;
}
BeginRepeat.prototype = Object.create(Row.prototype);
BeginRepeat.prototype.constructor = BeginRepeat;
BeginRepeat.prototype.generateHtml = function () {
    console.log("BeginRepeat");
    return "<a id=\"start-menu-contribute\" data-role=\"button\" data-icon=\"plus\" data-iconpos=\"right\" data-theme=\"c\" data-i18n=\"buttons.contribute\" " +
        "class=\"ui-link ui-btn ui-btn-c ui-icon-plus ui-btn-icon-right ui-shadow ui-corner-all\" role=\"button\">" + this.getLabel() + "</a>";
};
BeginRepeat.prototype.onNext = function () {

};
BeginRepeat.prototype.onBack = function () {
    return; //do nothing
};
BeginRepeat.prototype.prepare = function () {
    $('#start-menu-contribute').on("vclick", function () {
        $('#_next').show();
        $('#_back').show();
        $('#_next').click();
    });
    $('#_next').hide();
    $('#_back').hide();
};
BeginRepeat.prototype.doInternal = function (i) {
    inLoop = true;
    lastLoopBeginIndex = i;
    return true;
};
// end of one iteration, so the data must submit into db
function EndRepeat() {
    Row.call(this);
    this.hasDrawable = false;
}
EndRepeat.prototype = Object.create(Row.prototype);
EndRepeat.prototype.constructor = EndRepeat;
EndRepeat.prototype.doInternal = function (i) {
    inLoop = false;
    //i = lastLoopBeginIndex;
    //method to submit values into db
    this.submit();
    generateDynamicByX(lastLoopBeginIndex); //index og begin repeat
    return false;
};
EndRepeat.prototype.submit = function () { // function submit into couch db

    endRef.end(); // refer to the time the iteration has been end
    var timestamp = new Date().toISOString(); // Timestamp is our id to submit a record into db
    //here get LatLng of the marker
    //curLatLng=[marker.getLatLng().lat, marker.getLatLng().lng];
    var poi = {};
    for (var i = 0; i < rowList.length; i++) { // the parts that are dynamically changed would read with a for loop and submit into db.
        //if (rowList[i].getValue() != undefined || rowList[i].getValue() != '')
        poi[rowList[i].gId()] = rowList[i].getValue();
    }
    poi["_id"] = timestamp; // the parts like id would be get and submit out of loop.
    var uuid = device.uuid;
    if (uuid == null)
        uuid = new Fingerprint().get().toString() + "-PC";
    poi["user"] = uuid;

    localDB.put(poi, function callback(err, result) { // insert into db , and a callback is carrying the error in case it has
        if (!err) {
            console.log('Successfully posted a todo!');
        }
    });


    if (networkState == Connection.NONE || networkState_browser == false) //check existence of internet connection
        navigator.notification.alert(i18n.t('messages.contribution-success-noInternet'), alertDismissed_contributionSuccess, "Via Regina", i18n.t('messages.ok'));
    else
        navigator.notification.alert(i18n.t('messages.contribution-success'), alertDismissed_contributionSuccess, "Via Regina", i18n.t('messages.ok'));

    function alertDismissed_contributionSuccess() {
        return; // todo
    }

};
function Note() {
    Row.call(this);
    this.hasDrawable = true;
}
Note.prototype = Object.create(Row.prototype);
Note.prototype.constructor = Note;
Note.prototype.generateHtml = function () {
    console.log("Note");
    return " <div>" +
        "<span id=\"" + this.gId() + "\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "</div>";
};
Note.prototype.onNext = function () {
    //return this.chkRequiredAndConstraint("value can't be empty");
};
Note.prototype.onBack = function () {
    this.value = ''; //reset value
};
Note.prototype.prepare = function () {
    return; //do nothing
};
function Select_one() {
    Row.call(this);
    this.hasDrawable = true;
}
Select_one.prototype = Object.create(Row.prototype);
Select_one.prototype.constructor = Select_one;
Select_one.prototype.generateHtml = function () {
    console.log("Select_one"); //http://demos.jquerymobile.com/1.4.5/popup/ --> Menu --> click on Action button->  uses this link to

    result = "<a href=\"#popupClass\" id=\"classPOI\"  data-rel=\"popup\" " +
        " class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-carat-d\"  " +
        " data-position-to=\"window\" data-inline=\"true\" data-theme=\"c\" data-transition=\"pop\" " +
        " data-i18n=\"classes.select\">" + this.getLabel() + "</a>" +
        " <div data-role=\"popup\" id=\"popupClass\" data-theme=\"c\" class=\"ui-corner-all\"> " +
        " <form> " +
        " <fieldset id=\"popupControlgroup\" data-role=\"controlgroup\" data-type=\"vertical\" style=\"margin-top: 0px;\"> ";
    for (var i = 0; i < this.choice.items.length; i++) {
        result += "<a href=\"#\"><label for=\"radio-choice-" + i + "a\" class=\"valign\">";
        if (this.choice.items[i].image != undefined && this.choice.items[i].image != "") {
            result += " <img id=\"" + this.choice.items[i].name + "_img" + "\" src=\"" + this.choice.items[i].image + "\" class=\"valign\" style=\"width: 15px;height: 15px;\"/> ";
        }
        result += "<span " +
            " data-i18n=\"classes.civil-building\"> " + this.choice.items[i].label + "</span></label><input type=\"radio\" " +
            " name=\"popupRadioName\"" +
            "  data-radioPopup=\"true\" id=\"radio-choice-" + i + "a\" " +
            " value=\"" + this.choice.items[i].name + "\"></input></a>";
    }
    result += "<a href=\"#\">" +
        "<button type=\"button\" class=\"ui-btn ui-icon-check ui-btn-icon-right ui-corner-all\" " +
        "id=\"class_ok\">OK " +
        "</button> " +
        "</a> " +
        "</fieldset> " +
        "</form> " +
        "</div>";
    return result;
};
Select_one.prototype.onNext = function () {
    if (classification != undefined || classification != '') {
        this.value = classification; //the item's value that read from radio button which user has selected.

    }
    if (this.chkRequiredAndConstraint("Please Select one Item")) {
        //destroy popup completely
        $("#popupClass").popup("destroy"); //if it does not have problem of required field and constraint then destroy the popup and return true
        return true;
    } else {
        return false;
    }

};
Select_one.prototype.onBack = function () {

    //destroy popup completly
    $("#popupClass").popup("destroy");

    this.value = ''; //reset value
};
// when we want to generate an HTML during runtime and show it to the user, then to make the jquery aware of these changes we will use popup method.
Select_one.prototype.prepare = function () {// prepare method will be run after generate html
    $("#popupControlgroup").controlgroup({
        type: "vertical"
    });
    $("#popupControlgroup").controlgroup("enable");
    //create popup
    $("#popupClass").popup();

    //enable - due to browser compatibility
    $("#popupClass").popup("enable");

    //close popup that is listing the classes
    $('#class_ok').on("vclick", function () { // the OK Button end of the select_one menu
        setTimeout(function () {
            $("#popupClass").popup("close");
        }, 1);
    });

    //set the text on the button to the selected class
    $("#popupClass").on('popupafterclose', function () {
        if (classification != "") {
            var idOfValue = $("input[value='" + classification + "']").attr('id');
            var labelFor = $("label[for='" + idOfValue + "']").text();
            $('#classPOI').text(labelFor);

        }
    });
    //make the class list scrollable
    $('#popupClass').on({
        popupbeforeposition: function (e) {
            var maxHeight = $(window).height() - 20;
            $('#popupClass').css('max-height', maxHeight + 'px');
        }
    });

    $("[data-radioPopup=\"true\"]").on("click", function () {
        classification = $(this).val(); // any item get clicked then the value will be assigned to the classification
    });

    $('#popupClass').css('overflow-y', 'scroll');
};
function Select_multi() {
    Row.call(this);
    this.hasDrawable = true;
}
Select_multi.prototype = Object.create(Row.prototype);
Select_multi.prototype.constructor = Select_multi;
Select_multi.prototype.generateHtml = function () {
    console.log("Select_multi"); //http://demos.jquerymobile.com/1.4.5/popup/ --> Menu --> click on Action button->  uses this link to


    result = "<a href=\"#popupClass\" id=\"classPOI\"  data-rel=\"popup\" " +
        " class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-carat-d\"  " +
        " data-position-to=\"window\" data-inline=\"true\" data-theme=\"c\" data-transition=\"pop\" " +
        " data-i18n=\"classes.select\">" + this.getLabel() + "</a>" +
        " <div data-role=\"popup\" id=\"popupClass\" data-theme=\"c\" class=\"ui-corner-all\"> " +
        " <form> " +
        " <fieldset id=\"popupControlgroup\" data-role=\"controlgroup\" data-type=\"vertical\" style=\"margin-top: 0px;\"> ";
    for (var i = 0; i < this.choice.items.length; i++) {
        result += "<a href=\"#\"><label for=\"radio-choice-" + i + "a\" class=\"valign\">";
        if (this.choice.items[i].image != undefined && this.choice.items[i].image != "") {
            result += " <img id=\"" + this.choice.items[i].name + "_img" + "\" src=\"" + this.choice.items[i].image + "\" class=\"valign\" style=\"width: 15px;height: 15px;\"/> ";
            //result += " <img id=\"" + this.choice.items[i].name + "_img" + "\" src=\"css/lib/images/icons_class/civil_building.png\" class=\"valign\"/> ";
        }
        result += "<span " +
            " data-i18n=\"classes.civil-building\"> " + this.choice.items[i].label + "</span></label><input type=\"checkbox\" " +
            " name=\"popupRadioName\"" +
            "  data-radioPopup=\"true\" id=\"radio-choice-" + i + "a\" " +
            " value=\"" + this.choice.items[i].name + "\"></input></a>";
    }
    result += "<a href=\"#\">" +
        "<button type=\"button\" class=\"ui-btn ui-icon-check ui-btn-icon-right ui-corner-all\" " +
        "id=\"class_ok\">OK " +
        "</button> " +
        "</a> " +
        "</fieldset> " +
        "</form> " +
        "</div>";
    return result;

};
Select_multi.prototype.onNext = function () {
    this.value = [];
    upperThisRef = this;
    $('input[type=checkbox][name=popupRadioName]:checked').each(function (index, item) {
        upperThisRef.value.push(item.value);
    });
    if (this.chkRequiredAndConstraint("Please Select one Item")) {
        //destroy popup completely
        $("#popupClass").popup("destroy"); //if it does not have problem of required field and constraint then destroy the popup and return true
        return true;
    } else {
        this.value = '';
        return false;
    }

};
Select_multi.prototype.onBack = function () {

    //destroy popup completly
    $("#popupClass").popup("destroy");

    this.value = ''; //reset value
};
// when we want to generate an HTML during runtime and show it to the user, then to make the jquery aware of these changes we will use popup method.
Select_multi.prototype.prepare = function () {// prepare method will be run after generate html
    $("#popupControlgroup").controlgroup({
        type: "vertical"
    });
    $("#popupControlgroup").controlgroup("enable");
    //create popup
    $("#popupClass").popup();

    //enable - due to browser compatibility
    $("#popupClass").popup("enable");

    //close popup that is listing the classes
    $('#class_ok').on("vclick", function () { // the OK Button end of the Select_multi menu
        setTimeout(function () {
            $("#popupClass").popup("close");
        }, 1);
    });

    //set the text on the button to the selected class
    $("#popupClass").on('popupafterclose', function () {
        if (classification != "") {
            var idOfValue = $("input[value='" + classification + "']").attr('id');
            var labelFor = $("label[for='" + idOfValue + "']").text();
            $('#classPOI').text(labelFor);
        }
    });
    //make the class list scrollable
    $('#popupClass').on({
        popupbeforeposition: function (e) {
            var maxHeight = $(window).height() - 20;
            $('#popupClass').css('max-height', maxHeight + 'px');
        }
    });


    $('#popupClass').css('overflow-y', 'scroll');
};
function Text() {
    Row.call(this);
    this.hasDrawable = true;
}
Text.prototype = Object.create(Row.prototype);
Text.prototype.constructor = Text;
Text.prototype.generateHtml = function () {
    console.log("Text");
    return " <div>" +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div class=\"ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset\"><input type=\"text\" id=\"" + this.gId() + "\"></div>" +
        "</div>";
};
Text.prototype.onNext = function () {
    this.value = $("#" + this.gId()).val();
    return this.chkRequiredAndConstraint("value can't be empty");
};
Text.prototype.onBack = function () {
    this.value = ''; //reset value
};
Text.prototype.prepare = function () {
    return; // no preparation required
};
function Calculation() {
    Row.call(this);
    this.hasDrawable = false;

}
Calculation.prototype = Object.create(Row.prototype);
Calculation.prototype.constructor = Calculation;
Calculation.prototype.doInternal = function (i) {
    tmpCalculation = this.calculation;
    // the variable which we need the value in an xls file is like ${variable}
    // if there is no ${variable} then it returns -1 nd never enters the for loop
    for (var hasSign = tmpCalculation.indexOf("${"); hasSign >= 0; hasSign = tmpCalculation.indexOf("${")) {
        var endSign = tmpCalculation.indexOf("}");
        contextVar = tmpCalculation.substr(hasSign + 2, endSign - hasSign - 2); //find the name in the middle of curly brackets.
        try {
            actualValue = eval(contextVar);
        } catch (e) {
            actualValue = " n/a ";
        }
        tmpCalculation = tmpCalculation.replace(("${" + contextVar + "}"), actualValue);
    }
    try {
        this.value = eval(tmpCalculation);
        this.exportValue();
    } catch (ignore) {

    }
};
Calculation.prototype.onNext = function () {

};
Calculation.prototype.onBack = function () {

};
Calculation.prototype.prepare = function () {

};
function Image() {
    Row.call(this);
    this.hasDrawable = true;
}
Image.prototype = Object.create(Row.prototype);
Image.prototype.constructor = Image;
Image.prototype.generateHtml = function () {
    console.log("Image");
    return "<div>" +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div ><input type=\"file\" id=\"" + this.gId() + "\"></div></div>";

};
Image.prototype.exportValue = function () {
    return;
};
Image.prototype.resetValue = function () {
    return;
};
Image.prototype.onNext = function () {
    return this.chkRequiredAndConstraint("value can't be empty");
};
Image.prototype.onBack = function () {
    this.value = ''; //reset value
};
Image.prototype.prepare = function () {
    upperThisRef = this;
    $("#" + this.gId()).change(function () {
        var file = this.files[0];
        if (!(file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.gif') || file.name.toLowerCase().endsWith('.jpeg'))) {
            alert('Please Select Image File... (jpg | gif | jpeg)');
            return;
        }
        var reader = new FileReader(); // create reader
        reader.onload = function (event) { // when the image has been loaded:
            var url = event.target.result; // data related to the image assigned to url in base64 format
            //console.log(url);
            upperThisRef.value = url.substr(url.indexOf(',') + 1); // we want to have the date related to the image purely without extra info
        };

        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file); // convert to base64
    });
};
function Audio() {
    Row.call(this);
    this.hasDrawable = true;
}
Audio.prototype = Object.create(Row.prototype);
Audio.prototype.constructor = Audio;
Audio.prototype.generateHtml = function () {
    console.log("Audio");
    return "<div>" +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div ><input type=\"file\" id=\"" + this.gId() + "\"></div></div>";
};
Audio.prototype.exportValue = function () {
    return;
};
Audio.prototype.resetValue = function () {
    return;
};
Audio.prototype.onNext = function () {
    return this.chkRequiredAndConstraint("select an audio...");
};
Audio.prototype.onBack = function () {
    this.value = ''; //reset value
};
Audio.prototype.prepare = function () {
    upperThisRef = this;
    $("#" + this.gId()).change(function () {
        //console.log(this.files[0].size);
        //renderImage(this.files[0]);
        var file = this.files[0];
        if (!(file.name.endsWith('.mp3') || file.name.endsWith('.ogg') || file.name.endsWith('.wav'))) {
            alert('Please Select Audio File... (mp3 | ogg | wav)');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            var url = event.target.result;
            //console.log(url);
            upperThisRef.value = url.substr(url.indexOf(',') + 1);
            //console.log(image);
        };

        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file);
    });
};
function Video() {
    Row.call(this);
    this.hasDrawable = true;
}
Video.prototype = Object.create(Row.prototype);
Video.prototype.constructor = Video;
Video.prototype.generateHtml = function () {
    console.log("Video");
    return "<div>" +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div ><input type=\"file\" id=\"" + this.gId() + "\"></div></div>";
};
Video.prototype.exportValue = function () {
    return;
};
Video.prototype.resetValue = function () {
    return;
};
Video.prototype.onNext = function () {
    return this.chkRequiredAndConstraint("select an video...");
};
Video.prototype.onBack = function () {
    this.value = ''; //reset value
};
Video.prototype.prepare = function () {
    upperThisRef = this;
    $("#" + this.gId()).change(function () {
        //console.log(this.files[0].size);
        //renderVideo(this.files[0]);
        var file = this.files[0];
        if (!(file.name.endsWith('.mp4') || file.name.endsWith('.avi') || file.name.endsWith('.flv'))) {
            alert('Please Select Video File... (mp4 | avi | flv)');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            var url = event.target.result;
            //console.log(url);
            upperThisRef.value = url.substr(url.indexOf(',') + 1);
            //console.log(Video);
        };

        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file);
    });
};
function Integer() {
    Row.call(this);
    this.hasDrawable = true;
}
Integer.prototype = Object.create(Row.prototype);
Integer.prototype.constructor = Integer;
Integer.prototype.generateHtml = function () {
    console.log("Integer");
    var result = "<div> " +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div class=\"ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset\"><input type=\"text\" id=\"" + this.gId() + "\"></div>" +
        "</div>";


    return result;
};
Integer.prototype.onNext = function () {
    this.value = $("#" + this.gId()).val();
    return this.chkRequiredAndConstraint("value can't be empty");
};
Integer.prototype.onBack = function () {
    this.value = ''; //reset value
};
Integer.prototype.prepare = function () {
    return; // no preparation required
};
function Decimal() {
    Row.call(this);
    this.hasDrawable = true;
}
Decimal.prototype = Object.create(Row.prototype);
Decimal.prototype.constructor = Decimal;
Decimal.prototype.generateHtml = function () {
    console.log("Decimal");
    var result = "<div> " +
        "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div class=\"ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset\"><input type=\"text\" id=\"" + this.gId() + "\"></div>" +
        "</div>";
};
Decimal.prototype.onNext = function () {
    this.value = $("#" + this.gId()).val();
    return this.chkRequiredAndConstraint("value can't be empty");
};
Decimal.prototype.onBack = function () {
    this.value = ''; //reset value
};
Decimal.prototype.prepare = function () {
    return; // no preparation required
};
function MyDate() {
    Row.call(this);
    this.hasDrawable = true;
}
MyDate.prototype = Object.create(Row.prototype);
MyDate.prototype.constructor = MyDate;
MyDate.prototype.generateHtml = function () {
    console.log("MyDate");
    var result = "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div> " +
        "<input id=\"" + this.gId() + "\" placeholder=\"YYYY-MM-DD\" type=\"text\">" +
        "</div>";

    return result;
};
MyDate.prototype.onNext = function () {
    this.value = $("#" + this.gId()).val();
    return this.chkRequiredAndConstraint("date can't be empty");
};
MyDate.prototype.onBack = function () {
    this.value = ''; //reset value
};
MyDate.prototype.prepare = function () {
    return; // no preparation required
};
function MyTime() {
    Row.call(this);
    this.hasDrawable = true;
}
MyTime.prototype = Object.create(Row.prototype);
MyTime.prototype.constructor = MyTime;
MyTime.prototype.generateHtml = function () {
    console.log("MyTime");
    var result = "<span id=\"comment-label\" class=\"label\" data-i18n=\"comment\">" + this.getLabel() + "</span>" +
        "<div> " +
        "<input id=\"" + this.gId() + "\" placeholder=\"HH:MM\" type=\"text\">" +
        "</div>";

    return result;
};
MyTime.prototype.onNext = function () {
    this.value = $("#" + this.gId()).val();
    return this.chkRequiredAndConstraint("date can't be empty");
};
MyTime.prototype.onBack = function () {
    this.value = ''; //reset value
};
MyTime.prototype.prepare = function () {
    return; // no preparation required
};
function GeoPoint() {
    Row.call(this);
    this.hasDrawable = true;
}
GeoPoint.prototype = Object.create(Row.prototype);
GeoPoint.prototype.constructor = GeoPoint;
GeoPoint.prototype.generateHtml = function () {
    console.log("GeoPoint");
    return "<div > " +
        "<a id=\"" + this.gId() + "\" data-role=\"button\" data-icon=\"location\" data-iconpos=\"right\" data-theme=\"c\" data-i18n=\"buttons.contribute\" class=\"ui-link ui-btn ui-btn-c ui-icon-plus ui-btn-icon-right ui-shadow ui-corner-all\" role=\"button\" style=\"cursor: auto;\">+" + this.getLabel() + "</a> " +
        "</div>";
};
GeoPoint.prototype.exportValue = function () {
    return;
};
GeoPoint.prototype.resetValue = function () {
    return;
};
GeoPoint.prototype.onNext = function () {
    this.value = curLatLng; // submit into db
    if (this.required && this.value == undefined || this.value == '') {
        return false;
    }

    isContributing = false;
    watchCallback_Popup = false;
    //clean map view
    if (markersAll) {
        map.removeLayer(markersAll.markers_historical_cultural);
        map.removeLayer(markersAll.markers_morphological);
        map.removeLayer(markersAll.markers_touristic);
        map.removeLayer(markersAll.markers_critical);
    }
    if (markersMy) {
        map.removeLayer(markersMy.markers_historical_cultural);
        map.removeLayer(markersMy.markers_morphological);
        map.removeLayer(markersMy.markers_touristic);
        map.removeLayer(markersMy.markers_critical);
    }
    map.hasLayer(marker) || map.addLayer(marker);
    marker.closePopup();
    //marker.setIcon(classIcon());
    messages_warninglocation = i18n.t('messages.warning-location');
    marker.setPopupContent(messages_warninglocation).closePopup();
    isContributing = false; //not in contributing mode
    marker.dragging.disable();
    map._onResize();
    if (watchId != null) {
        if (navigator.geolocation)
            navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    return true;
};
GeoPoint.prototype.onBack = function () {
    isContributing = false;
    watchCallback_Popup = false;
    //clean map view
    if (markersAll) {
        map.removeLayer(markersAll.markers_historical_cultural);
        map.removeLayer(markersAll.markers_morphological);
        map.removeLayer(markersAll.markers_touristic);
        map.removeLayer(markersAll.markers_critical);
    }
    if (markersMy) {
        map.removeLayer(markersMy.markers_historical_cultural);
        map.removeLayer(markersMy.markers_morphological);
        map.removeLayer(markersMy.markers_touristic);
        map.removeLayer(markersMy.markers_critical);
    }
    map.hasLayer(marker) || map.addLayer(marker);
    marker.closePopup();
    if (watchId != null) {
        if (navigator.geolocation)
            navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    this.value = ''; //reset value
};
GeoPoint.prototype.prepare = function () {
    isContributing = true;
    watchCallback_Popup = true;
    if (markersAll) {
        map.removeLayer(markersAll.markers_historical_cultural);
        map.removeLayer(markersAll.markers_morphological);
        map.removeLayer(markersAll.markers_touristic);
        map.removeLayer(markersAll.markers_critical);
    }
    if (markersMy) {
        map.removeLayer(markersMy.markers_historical_cultural);
        map.removeLayer(markersMy.markers_morphological);
        map.removeLayer(markersMy.markers_touristic);
        map.removeLayer(markersMy.markers_critical);
    }

    map.hasLayer(marker) || map.addLayer(marker);
    messages = i18n.t('messages.getting-location');
    if (marker.getPopup() != null)
        marker.setPopupContent(messages).openPopup();
    else
        marker.bindPopup(messages).openPopup();
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition( //orange marker moves
            function (position) {
                curLatLng = [position.coords.latitude, position.coords.longitude];
                curLatLngAccuracy = position.coords.accuracy;
                map.panTo(curLatLng);
                marker.setLatLng(curLatLng);
                if (watchCallback_Popup) {
                    marker.setPopupContent(i18n.t('messages.marker-popup')).openPopup();
                }
                watchCallback_Popup = false;
                marker.dragging.enable();
            },
            function (error) {
                messages_gpserror = i18n.t('messages.gps-error');
                marker.setPopupContent(messages_gpserror).openPopup();
                marker.dragging.enable();
                watchCallback_Popup = true;
            },
            {maximumAge: 3000, timeout: 15000, enableHighAccuracy: true}
        );
    }

};

function Choice() {
    this.items = [];
}
Choice.prototype = {
    constructor: Choice,

    setListName: function (listName) {
        this.listName = listName;
    },

    setItems: function (items) {
        this.items = items;
    },

    addItem: function (item) {
        this.items.push(item);
    }
};
function ChoiceItem() {

}
ChoiceItem.prototype = {
    constructor: ChoiceItem,

    setName: function (name) {
        this.name = name;
    },
    setLabel: function (label) {
        this.label = label;
    },
    setImage: function (image) {
        this.image = image;
    }
};

function process_wb(wb) {

    for (i = 0; i < SHEET_NAMES.length; i++) {
        if (SHEET_NAMES[i] != wb.SheetNames[i]) {
            if (typeof console !== 'undefined')
                console.log("sheet names error !!! expected [" + SHEET_NAMES[i] + "] found [" + wb.SheetNames[i] + "]");
            //todo alert message to user by updating DOM
            return;
        }
    }


    output = process_sheets(wb);
    if ($('#navbar-change-xls').hasClass('ui-btn-active')) {
        window.localStorage.setItem('xlsData', JSON.stringify(rowList));
        location.reload();
    }
    if (typeof console !== 'undefined')
        console.log("xls - finished", new Date());
}

function process_sheets(workbook) {
    var result = [];

    process_choices(workbook.Sheets[SHEET_NAMES[1]]);
    process_survey(workbook.Sheets[SHEET_NAMES[0]]);
    process_settings(workbook.Sheets[SHEET_NAMES[2]]);
    return result.join("\n");
}

function process_settings(sheet, opts) {
    formId = sheet.A2 == undefined ? '' : sheet.A2.v;
    formTitle = sheet.B2 == undefined ? '' : sheet.B2.v;
    defaultLanguage = sheet.C2 == undefined ? '' : sheet.C2.v;
}
function process_choices(sheet, opts) {
    if (sheet == null || sheet["!ref"] == null) return "";
    var r = X.utils.decode_range(sheet["!ref"])
    var FS = ",";
    var RS = "\n";
    var row = "", rr = "", cols = [];
    var i = 0, cc = 0, val;
    var R = 0, C = 0;
    for (C = r.s.c; C <= r.e.c; ++C) {
        cols[C] = X.utils.encode_col(C);
    }
    var lastListName = '';
    var items = [];
    for (R = r.s.r + 1; R <= r.e.r; ++R) {

        var choiceItem = new ChoiceItem();
        rr = X.utils.encode_row(R);
        for (C = r.s.c; C <= r.e.c; ++C) {
            val = sheet[cols[C] + rr];
            if (C == 0 && val != undefined) {// if is first column means list name.
                lastListName = val.v;
            } else {
                if (val !== undefined) {
                    var s = 'set' + capitalizeFirstLetter(CHOICES_SHEET_COLUMNS[C - 1]);
                    choiceItem[s]((val.v.trim != undefined ? val.v.trim() : val.v));
                } else {
                    if (C == 0) {
                        var choice = new Choice();
                        choice.setListName(lastListName);
                        choice.setItems(items);
                        choiceList.push(choice);
                        var items = [];
                        break;
                    }
                }
            }
        }
        if (choiceItem.name != undefined)
            items.push(choiceItem);

    }
    var choice = new Choice();
    choice.setListName(lastListName);
    choice.setItems(items);
    choiceList.push(choice);
}
function process_survey(sheet, opts) {
    if (sheet == null || sheet["!ref"] == null) return "";
    var r = X.utils.decode_range(sheet["!ref"])
    var FS = ",";
    var RS = "\n";
    var rr = "", cols = [];
    var i = 0, cc = 0, val;
    var R = 0, C = 0;
    for (C = r.s.c; C <= r.e.c; ++C) {
        cols[C] = X.utils.encode_col(C);
    }

    for (R = r.s.r; R <= r.e.r; ++R) {

        var row;
        rr = X.utils.encode_row(R);
        for (C = r.s.c; C <= r.e.c; ++C) {
            val = sheet[cols[C] + rr];
            if (val !== undefined) {
                var rColumn = capitalizeFirstLetter(SURVEY_SHEET_COLUMNS[C]);
                var s = 'set' + rColumn;
                if (rColumn == (capitalizeFirstLetter(SURVEY_SHEET_COLUMNS[0]))) {
                    if (TYPES[(val.v.trim().toUpperCase())] != undefined) {
                        row = TYPES[(val.v.trim().toUpperCase())]();
                    } else {
                        tmp_typ = val.v.trim();
                        if (tmp_typ.substring(0, select_one_type.length) == select_one_type ||
                            tmp_typ.substring(0, select_multi_type.length) == select_multi_type) {
                            tmp_name = tmp_typ.trim().toUpperCase().split(" ");
                            tmp_name = tmp_name[0];
                            row = TYPES[tmp_name]();
                            var selectListName = tmp_typ.trim().split(" ")[1];
                            for (i = 0; i < choiceList.length; i++) {
                                if (choiceList[i].listName == selectListName) {
                                    row.setChoice(choiceList[i]);
                                    break;
                                }
                            }

                        } else {
                            row = new Row();
                        }
                    }
                }
                row[s]((val.v.trim != undefined ? val.v.trim() : val.v));
            } else {
                if (C == 0) {
                    break;
                }
            }
        }
        if (row.type != undefined) {
            rowList.push(row);

        }

    }

}

function capitalizeFirstLetter(string) {
    if (string != undefined)
        return string[0].toUpperCase() + string.slice(1);
    else return "undefined";
}
function generateDynamicByX(i) {
    for (; i < rowList.length; i++) {
        var currentRow = rowList[i];
        if (currentRow.doInternal != undefined) {
            result = currentRow.doInternal(i); //// doInternal called before generateHtml
        }
        if (currentRow.hasDrawable) {
            //draw the content
            $("#_dynamicContent").html(currentRow.generateHtml());

            //call to prepare
            currentRow.prepare(); //, but prepare method called after generateHtml

            //set next button
            $("#_next").data("whereToGo", i + 1);
            $("#_next").data("cur_item", currentRow);

            //set prev button
            $("#_back").data("whereToGo", i - 1);
            $("#_back").data("cur_item", currentRow);
            break;
        }

    }
}

function registerXlsRCallback() { //purely java script, no jquery.
    // this is the start point of Dynamic generator in case the user upload xls file in the registration page
    // OR by using the Change XLS tab , upload a new xls file

    /***
     EXCEL - start
     ***/
    var xlf = document.getElementById('xlsFile'); // it points to the upload xls file in registration page

    var xlfAlt = document.getElementById('changeXlsFile'); // it points to the upload file in the change xls tab


    function handleFile1(e) {

        var files = e.target.files;
        var f = files[0];
        rowList.length = 0;
        choiceList.length = 0;
        {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function (e) {
                if (typeof console !== 'undefined')
                    console.log("onload", new Date());
                var data = e.target.result;
                var wb;
                wb = X.read(data, {type: 'binary'});
                process_wb(wb);

            };
            reader.readAsBinaryString(f);

        }
    }

    if (xlf.addEventListener) xlf.addEventListener('change', handleFile1, false);
    if (xlfAlt.addEventListener) xlfAlt.addEventListener('change', handleFile1, false);
    /***
     EXCEL - end
     ***/
}


function startByX() { // Start point of the Dynamic generator app in case there IS xlsData in local storage
    //try to generate dynamic content #generate_dynamic
    generateDynamicByX(0);
    $("#_next").on("vclick", function () {
        var currentItem = $("#_next").data("cur_item");
        approveToContinue = currentItem.onNext();
        if (approveToContinue == undefined || approveToContinue) {
            generateDynamicByX($("#_next").data("whereToGo"));
        }
    });
    $("#_back").on("vclick", function () {
        var currentItem = $("#_back").data("cur_item");
        currentItem.onBack();
        generateDynamicByX($("#_back").data("whereToGo"));
    });
}

//newly added to support excel - end