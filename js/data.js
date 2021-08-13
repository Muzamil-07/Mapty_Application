"use strict";
// !! *********************** All Targeted Html Elements *******************************
const form = document.querySelector(".workOut_form");
const start = document.querySelector("#start");
const typeInp = document.querySelector("#Type");
const distanceInp = document.querySelector(".distance_input");
const durationInp = document.querySelector(".duration_input");
const cadElvInp = document.querySelectorAll(".cad_elv_input");
const cadInp = document.querySelector(".cad_inp");
const elvInp = document.querySelector(".elv_inp");
const cadElvText = document.querySelectorAll(".cad_elv_text");

const inp_array = [distanceInp, durationInp, cadInp, elvInp];

const distanceVal = document.querySelector(".distance");
const durationVal = document.querySelector(".duration");
const thunderVal = document.querySelector(".thunder");
const mountVal = document.querySelector(".mount");

const workOutBox = document.querySelector(".workout_entries");
const mapContainer = document.querySelector(".map_container");
const errorMsg = document.querySelector(".error_msg");
const deleteAllBtn = document.querySelector(".f_delete");
const closeFormBtn = document.querySelector(".close_form");
const FORM_out = form.outerHTML;
const FORM_in = form.innerHTML;
const sortByTypeBtn = document.querySelector(".sort_by_type");
const sortByDistanceBtn = document.querySelector(".sort_by_distance");
const sortByDurationBtn = document.querySelector(".sort_by_duration");
const sortBox = document.querySelector(".dropdown-menu");
const moveUpBtn = document.querySelector(".move_up_btn");
// !! ************************* Basic variables ************************



//Optimize !! ********************* WorkOut(The Parent) Class ***********************
class Workout {
    id = String(Date.now());
    date = new Date();

    constructor(distance, duration, coords) {
        this.distance = distance; //?    in km
        this.duration = duration; //?    in minutes
        this.coords = coords; //?     array => [lat,lng]
    }
    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        return `${(this.type[0].toUpperCase() + this.type.slice(1)) + " on " + months[this.date.getMonth()] + " " + this.date.getDate()}`;
    }
}

//Optimize !! ********************* Running(The Child) Class ***********************
class Running extends Workout {
    type = "running";
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence; //?   in step/min
        this.pace = this.calcPace(); //?    formula = min/km
        this.description = this._setDescription();
    }
    calcPace() {
        return this.duration / this.distance;
    }
}

//Optimize !! ********************* Cycling(The Child) Class ***********************

class Cycling extends Workout {
    type = "cycling";
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain; //?  in meters
        this.speed = this.calcSpeed(); //?   formula = km/hours
        this.description = this._setDescription();
    }
    calcSpeed() {
        return this.distance / (this.duration / 60);
    }
}

// Fix:Smooth Scroll to map
moveUpBtn.addEventListener("click", function (e) {
    e.preventDefault();
    start.scrollIntoView({
        behavior: "smooth"
    });
});