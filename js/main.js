"use strict";

// !! ************************* Basic variables ************************

let layers = {};

//Optimize !! ********************* Main Application Class ***********************

class App {
    #map;
    #mapEvent;
    #workouts = [];
    #mapZoomLevel = 16;
    #count = 0;
    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkOut.bind(this));
        typeInp.addEventListener("change", this._toggleElevationField);
        workOutBox.addEventListener("click", this._moveToMarker.bind(this));
        this._renderWorkoutFrom_LocalStorageToSideBar();
        closeFormBtn.addEventListener("click", () => form.classList.add("hidden"));
        sortBox.addEventListener("click", this._sortWkorkoutsBy.bind(this));
        deleteAllBtn.addEventListener("click", this._deleteAllAct.bind(this));
       inp_array.forEach(inp=> inp.addEventListener("click",()=>errorMsg.classList.add("hidden")))
    }

    static inputsAreValid(...inputs) {
        return inputs.every(inp => Number.isFinite(inp) && inp > 0);
    }
    static ValidityMsg(...inputs) {
        const [distance, duration, cad_elv] = inputs;
        if (!Number.isFinite(distance) || distance<=0) {
            return "Distance must be positive value 🚨";
        }
        else if (!Number.isFinite(duration) || duration <= 0) {
            return "Duration must be positive value 🚨";
        }
        else if (!Number.isFinite(cad_elv) || cad_elv <= 0) {
            return "Cadence/Elevation Gain must be positive value 🚨";
        }
        else {
            return "";
        }
        
    }

    // Fix:Method to Get current position from browser and rendering map using geolocation API
    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
            alert("Can't get your current position 😥");
        });
    }

    // Fix:Method to load map and set map state to true 
    _loadMap(position) {
        const {
            latitude,
            longitude
        } = position.coords;
        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this._renderWorkout_FromLocalStorageToMap();
        this.#map.on("click", this._showForm.bind(this));

    }

    // Fix:rendering/displaying input form by clicking on map
    _showForm(mapPointer) {
       
        this.#mapEvent = mapPointer;
        form.classList.remove("hidden");
        form.classList.add("animate__animated", "animate__fadeInDown");
        distanceInp.focus();
    }
    _hideForm() {
        form.classList.add("hidden");
        distanceInp.value = durationInp.value = cadInp.value = elvInp.value = "";
        errorMsg.classList.add("hidden");
    }

    // Fix:Method to toggle cadence/elevation_gain input field
    _toggleElevationField() {
        cadElvText.forEach(inp => inp.classList.toggle("hidden"));
        cadElvInp.forEach(inp => inp.closest(".second_inp").classList.toggle("hidden"));
    }

    // Fix:Method to add workout information in workout container
    _newWorkOut(e) {

        e.preventDefault();
        const type = typeInp.value;
        const distance = Number(distanceInp.value);
        const duration = Number(durationInp.value);
        const {
            lat,
            lng
        } = this.#mapEvent.latlng;
        let workout;
        // if workout is running than create Running object and its specific logic after checking validition of input
        if (type === "running") {
            const cadence = Number(cadInp.value);
            // Checking for input validation
            if (!App.inputsAreValid(distance, duration, cadence)) {
                errorMsg.classList.remove("hidden");
                errorMsg.innerHTML = App.ValidityMsg(distance, duration, cadence);
                return;
            }
            workout = new Running(distance, duration, [lat, lng], cadence);

        }
        // if workout is cycling than create Cycling object and its specific logic after checking validition of input
        if (type === "cycling") {
            const elevation = Number(elvInp.value);

            // Checking for input validation
            if (!App.inputsAreValid(distance, duration, elevation)) {
                errorMsg.classList.remove("hidden");
                errorMsg.innerHTML = App.ValidityMsg(distance, duration, elevation);
                return;
            }
            workout = new Cycling(distance, duration, [lat, lng], elevation);
            
        }

        // Pushing each workout on App.#workout array 
        this.#workouts.push(workout);
        // Store workout in local storage
        this._setLocalStorage(this.#workouts);
        // Setting marker for workout on map
        this._renderWorkoutOnMap(workout);
        // Adding workout in workout container 
        this._renderWorkoutOnSideBar(workout);
        // Clearing and hiding the form
        this._hideForm();


    }

    // Fix:Method to add workOut marker on map
    _renderWorkoutOnMap(workout) {
    
       const lay=  L.marker(workout.coords).bindPopup(L.popup({
            minWidth: 130,
            maxWidth: 250,
            autoClose: false,
            closeOnClick: false,
            className: `pop_${workout.type}`
        })).setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
            .addTo(this.#map).openPopup(workout.coords);
       // Setting Out the layer id which used to remove layer from map;   
        workout.layer_id = lay._leaflet_id;
        layers[lay._leaflet_id] = lay;

    }
    // Fix:Method to add workOut on side bar 
    _renderWorkoutOnSideBar(workout) {
        const html = `<div class="workout_entry w_e type_${workout.type}" data-id=${workout.id}>
                                <span class="fav_edit_${this.#count} fav_icon edit_workout_btn f1" data-toggle="tooltip" title="Edit Activity"><i class="fas fa-pen "></i></span>
                                <span class="fav_delete_${this.#count} fav_icon f2 delete_workout_btn" data-toggle="tooltip" title="Delete Activity"><i class="fas fa-times "></i></span>
                        
                                <p class="heading pl-4"><span class="exercise">${workout.description}</p>
                        <div class="work_summary row">
                            <div class="col-3">
                               <span class="type_emoji emoji">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
                               <span class="distance num_val">${workout.distance}</span>
                               <span class="distance_unit units">KM</span>
                            </div>
                            
                            <div class="col-3">
                              <span class="emoji">⏱</span>
                              <span class="duration num_val">${workout.duration}</span>
                              <span class="duration_unit units">MIN</span>
                            </div>

                            <div class="col-3">
                              <span class="emoji">⚡</span>
                              <span class="thunder num_val">${workout.type === "running" ? workout.pace.toFixed(1):workout.speed.toFixed(1) }</span>
                              <span class="thunder_unit units">${workout.type === "running" ? "MIN/KM":"KM/H"}</span>
                            </div>
                           
                            <div class="col-3">
                               <span class="p_emoji emoji pl-2">${workout.type === "running" ? "🦶🏼":"⛰" }</span>
                               <span class="mount num_val">${workout.type === "running" ? workout.cadence:workout.elevationGain }</span>
                               <span class="mount_unit units">${workout.type === "running" ? "SPM":"M" }</span>
                            </div>
                            
                        </div>
                    </div>`;

        // console.log(html);
        document.querySelector(".workOut_form").insertAdjacentHTML("afterend", html)
        // form.insertAdjacentHTML("afterend", html);

        const editWorkoutBtn = document.querySelector(`.fav_edit_${this.#count}`);
        editWorkoutBtn.addEventListener("click", this._editWorkout.bind(this));
        const deleteWorkoutBtn = document.querySelector(`.fav_delete_${this.#count}`);
        deleteWorkoutBtn.addEventListener("click", this._deleteWorkout.bind(this));        


        this.#count++;
    }

    // Fix:Method to centered marker on map of targeted workout
    _moveToMarker(e) {
        if ((e.target.closest(".fav_icon"))) return;
        const targetEl = e.target.closest(".workout_entry");
        if (!targetEl) return;

        const target = e.target.closest(".workout_entry");
        if (target) {
            mapContainer.scrollIntoView({
                behavior: "smooth"
            });
        }
        const targetedID = targetEl.dataset.id;
        const targetCoords = this.#workouts.find(workout => workout.id === targetedID).coords; //[lat,lng] of targeted workout
        this.#map.setView(targetCoords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })

    }

    // Fix:Method to put our workouts/activities in local storage
    _setLocalStorage(workout) {
        localStorage.setItem("workouts", JSON.stringify(workout));
    }
    // Fix:Method to delete our workouts/activities from local storage
    reset() {
        localStorage.removeItem("workouts");
    }

    // Fix:Method to get workout from local storage and display on sideBar
    _renderWorkoutFrom_LocalStorageToSideBar() {
        const data = JSON.parse(localStorage.getItem("workouts"));
        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(workout => this._renderWorkoutOnSideBar(workout));
    }

    // Fix:Method to get workout from local storage and display on map
    _renderWorkout_FromLocalStorageToMap() {
        this.#workouts.forEach(workout => this._renderWorkoutOnMap(workout));
    }
    
    // Fix:Method to edit specific workout
    _editWorkout(e) {
        const targetWorkout = e.target.closest(".workout_entry");
        // console.log(targetWorkout);
        const idTarget = targetWorkout.dataset.id;
        const indexOfElementInArray = this.#workouts.findIndex((workout) => workout.id === idTarget);
        const lay_id = this.#workouts[indexOfElementInArray].layer_id;

        this.#map.removeLayer(layers[this.#workouts[indexOfElementInArray].layer_id]);
        
        const formForEdit = document.createElement("form");
        formForEdit.classList.add("w_e", "row", "edited_form");
        formForEdit.innerHTML = FORM_in;

        targetWorkout.parentNode.replaceChild(formForEdit, targetWorkout);
        formForEdit.querySelector(".distance_input").focus();

        const editedForm = document.querySelector(".edited_form");
        // change event listener on edited form
        const editFormCloseBtn = editedForm.querySelector(".close_form");
        const typInp = editedForm.querySelector("#Type");
        const cdElText = editedForm.querySelectorAll(".cad_elv_text");
        const cdElInp = editedForm.querySelectorAll(".cad_elv_input");
        // have to be
        typInp.addEventListener("change", function () {
            cdElText.forEach(inp => inp.classList.toggle("hidden"));
            cdElInp.forEach(inp => inp.closest(".second_inp").classList.toggle("hidden"));
        });

        // Adding event listeners to edited form
        editFormCloseBtn.addEventListener("click", function () {
            formForEdit.parentNode.replaceChild(targetWorkout, formForEdit);
            this.#map.addLayer(layers[this.#workouts[indexOfElementInArray].layer_id])
       }.bind(this))
        editedForm.addEventListener("submit", this._resubmitForm.bind([this, indexOfElementInArray,idTarget, formForEdit,typInp]));
    }

    // Fix:Method to resubmit our edited workout
    _resubmitForm(e) {
        e.preventDefault();

        const [that, indexOfEl, id, form, type] = this;
        // All targeted html elements after adding eiditable form
        const errorMsg = form.querySelector(".error_msg");
        const distInp = form.querySelector(".distance_input");
        const durInp = form.querySelector(".duration_input");
        const cdInp = form.querySelector(".cad_inp");
        const elInp = form.querySelector(".elv_inp");
        const inputArr = [distInp, durInp, cdInp, elInp];

        inputArr.forEach(inp => inp.addEventListener("click", () => errorMsg.classList.add("hidden")));
       
        const typeVal = type.value;
        const coords = that.#workouts[indexOfEl].coords;
        let newWorkOut;
        if (typeVal === "running") {
        
            if (!App.inputsAreValid(Number(distInp.value), Number(durInp.value), Number(cdInp.value))) {
                errorMsg.classList.remove("hidden");
                errorMsg.innerHTML = App.ValidityMsg(Number(distInp.value), Number(durInp.value), Number(cdInp.value));
                return;
            }
            newWorkOut = new Running(Number(distInp.value), Number(durInp.value), coords, Number(cdInp.value));
            newWorkOut.id = id;
        }
        if (typeVal === "cycling") {
            
            if (!App.inputsAreValid(Number(distInp.value), Number(durInp.value), Number(elInp.value))) {
                errorMsg.classList.remove("hidden");
                errorMsg.innerHTML = App.ValidityMsg(Number(distInp.value), Number(durInp.value), Number(elInp.value));
                return;
            }
            newWorkOut = new Cycling(Number(distInp.value), Number(durInp.value), coords, Number(elInp.value));
            newWorkOut.id = id;
        }
       
         // replace element in array
        that._replaceElementInArray(indexOfEl, newWorkOut);
         // Store workout in local storage
        that._setLocalStorage(that.#workouts);
        // hide the edited form
        form.classList.add("hidden");
        errorMsg.classList.add("hidden");

        // Clean WorkouBox for no duplication
        workOutBox.innerHTML = "";
        workOutBox.innerHTML = FORM_out;
     
        // getting our data back from updated local storage
        that._renderWorkoutFrom_LocalStorageToSideBar();
        that._renderWorkout_FromLocalStorageToMap();

        location.reload();
    }
    // Fix:Method to replace element in array
    _replaceElementInArray(index, replaceWithElement) {
        this.#workouts.splice(index, 1, replaceWithElement);
    }
    // Fix:Method to sort workouts
    _sortWkorkoutsBy(e) {
        workOutBox.innerHTML = "";
        workOutBox.innerHTML = FORM_out;
        const sortWith = e.target.innerText.split(" ")[0].toLowerCase();
        if (sortWith === "type") {
            this.#workouts=this.#workouts.sort((a, b) => {
               if (a[sortWith] < b[sortWith]) return -1;
               if (a[sortWith] > b[sortWith]) return 1;
                else return 0;
            });
            this.#workouts.forEach(workout => this._renderWorkoutOnSideBar(workout));
        }
        else {
            this.#workouts = this.#workouts.sort((a, b) => b[sortWith] - a[sortWith]);
            this.#workouts.forEach(workout => this._renderWorkoutOnSideBar(workout));
        }
     

    }

    _deleteWorkout(e) {
        const elementTodelete = e.target.closest(".workout_entry");
        const id = elementTodelete.dataset.id;
        const index = this.#workouts.findIndex(val => val.id === id);
        const coord = this.#workouts[index].coords;
        const lay_id = this.#workouts[index].layer_id;
       
        this.#map.removeLayer(layers[this.#workouts[index].layer_id]);
        
        this.#workouts.splice(index, 1);
        this._setLocalStorage(this.#workouts);
        workOutBox.innerHTML = "";
        workOutBox.innerHTML = FORM_out;
        this._renderWorkoutFrom_LocalStorageToSideBar();
        setTimeout(function(){location.reload()},500)
        
    }

    _deleteAllAct(e) {
        
        if (this.#workouts.length===0) return;
        this.#workouts.splice(0);
        const array = Object.values(layers);
        array.forEach(val => this.#map.removeLayer(val));
        this.reset();
        workOutBox.innerHTML = "";
        workOutBox.innerHTML = FORM_out;
        location.reload();
    }
}

const app = new App();
// console.log(app);
// console.log(layers);