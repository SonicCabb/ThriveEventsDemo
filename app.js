const NUM_EVENTS = 5;   //number of fake events to load

const eventSelector = document.querySelector("#eventSelector");     //event selector object
const tagFilter = document.querySelector(".filterList");            //filter object
const body = document.querySelector("body");                        //document body
//const peopleSelector = document.querySelector("#peopleSelector");   //people selector
const contactForm = document.querySelector("#contactForm");
const contactSubmitButton = document.querySelector("#submitContactInfoButton");
const mainSection = document.querySelector("#informationSection");

const contactInfo = document.querySelector("#contactInfo");
const emergencyContact = document.querySelector("#emergencyContact");

const peopleInfo = document.querySelector("#peopleInfo");
const peopleForm = document.querySelector("#peopleFormItems");

const waiver = document.querySelector("#waiver");
const signatureForm = document.querySelector("#signatureFormItems");

const eventArray = [];      //holds all availible events
let personArray = [];     //holds all signing up

let selectedEvent = 0;      //id of the currently selected event

let editingPerson = true;   //true if currently in an editing menu

//determines the current step the user is on.
let currentStep = 0;
let currentFilter = "ALL";  //holds the current filter

//class that holds event info
class ThriveEvent{
    constructor()
    {
        this.name = "default";
        this.description = "default";
        this.startDate= "00/00/00";
        this.endDate = "00/00/00";
        this.startTime = "12:00";
        this.endTime = "12:00";
        this.tag = "Other";
        
        this.maxSlots = 10000;
        this.currentSlots = 0;

        this.cost = 0;
        this.donation = 0;

        this.id = -1;
        this.visible = true;
        this.selected = false;
    }

    getStartDay()
    {
        let date = this.startDate[3] + this.startDate[4];
        switch (this.startDate[0] + this.startDate[1]) {
            case "01":
                return "Jan " + date;
                break;
            case "02":
                return "Feb " + date;
                break;
            case "03":
                return "Mar " + date;
                break;
            case "04":
                return "Apr " + date;
                break;
            case "05":
                return "May " + date;
                break;
            case "06":
                return "Jun " + date;
                break;
            case "07":
                return "Jul " + date;
                break;
            case "08":
                return "Aug " + date;
                break;
            case "09":
                return "Sep " + date;
                break;
            case "10":
                return "Oct " + date;
                break;
            case "11":
                return "Nov " + date;
                break;
            case "12":
                return "Dec " + date;
                break;
        
            default:
                return "default";
                break;
        }
    }
}

//class that deals holds personal info
class Person{
    constructor(){
        this.name = "default";
        this.age = 0;
        this.relation = "default";
        this.signature = "";
        this.signatureTimestamp = new Date;
    }
}

class SignUpInfo{
    constructor(){
        this.email = "default@default.com";
        this.phoneNumber = "xxx-xxx-xxxx";
        this.allergies = "";
        this.church = "";
        this.emName = "default";
        this.emRelation = "default";
        this.emNumber = "xxx-xxx-xxxx";
    }
}


let signUpInfo = new SignUpInfo;


//Event Listner for the event filter
tagFilter.addEventListener('click', function(e){
    if (e.target.classList.contains("tag"))
    {
        //remove the styling for unselected tags on the tag bar
        for (let i = 0; i < tagFilter.childElementCount; i++)
        {
            tagFilter.children[i].classList.remove("selectedTag");
        }

        //add styling to the selected tag
        e.target.classList.add("selectedTag");

        //filter the events
        setFilter(e.target.innerHTML);
    }
});

//Event listner for the event selector buttons
eventSelector.addEventListener('click', function(e){

    if(e.target.classList.contains("selectButton"))
    {

        //if navigating back to the selection screen
        if (currentStep !== 0)
        {
            e.target.parentNode.parentNode.children[1].children[0].classList.remove("bold");

            e.target.innerText = "Select";
            e.target.classList.remove("backButton");
        
            eventArray[selectedEvent].selected = false;
            currentStep = 0;

            tagFilter.parentNode.classList.remove("hidden");
            mainSection.classList.add("hidden");
        }
        else //if selecting a new event
        {
            //update the currently selected event number
            selectedEvent = e.target.parentNode.parentNode.id.replace("event", "");
            
            e.target.parentNode.parentNode.children[1].children[0].classList.add("bold");

            e.target.innerText = "Back";
            e.target.classList.add("backButton");

            //set the selected event to selected
            eventArray[selectedEvent].selected = true;
            currentStep = 1;

            tagFilter.parentNode.classList.add("hidden");
            peopleInfo.classList.remove("hidden");
            mainSection.classList.remove("hidden");
        }
        setFilter(currentFilter);
    }
});


mainSection.addEventListener('click', function(e){

    const tgt = e.target;
    if (tgt.classList.contains("editButton"))
    {
        collapseCard(tgt.closest(".infoCard"), false);
    }
    else if (tgt.classList.contains("actionButton"))
    {
        const parentCard = tgt.closest(".infoCard")

        if (tgt.classList.contains("addPersonButton"))
        {
            newPersonLine();
            savePersonInfo();
        }
        else if (tgt.classList.contains("deletePersonButton"))
        {
            personArray.splice(indexOfChild(tgt.parentNode), 1);    //remove the person from the person array
            tgt.parentNode.remove(); //remove registerant line
           
            refreshPeopleIds(); //refresh the ids of the rest of the people elements
            
        }

    }


});

mainSection.addEventListener('submit', function(e){

    e.preventDefault();

    if (e.target.id === "contactForm")
    {
        saveContactInfo();
    }
    else if (e.target.id === "emergencyForm")
    {
        saveEmergencyInfo();
    }
    else if  (e.target.id === "peopleForm")
    {
        savePersonInfo();
        contactInfo.classList.remove("hidden");
    }
    else if (e.target.id === "signatureForm")
    {
        saveSignatureInfo();
    }

});

mainSection.addEventListener('input', function(e){
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")
    {
        e.target.value ? e.target.classList.add("reqDone") : e.target.classList.remove("reqDone");
    }
});

function indexOfChild(element)
{
    let index2 = Array.from(element.parentNode.children).indexOf(element);
    return index2;
}

function refreshIdNumbers(element, number)
{
    //holds all the elements that have an id number to change
    const idElements = element.getElementsByClassName("hasIdNum");
    for (let i = 0; i < idElements.length; i++)
    {
        if(idElements[i].classList.length > 0)
        {
            //the new element id is the same as the first class name plus the id number
            idElements[i].id = idElements[i].classList[0] + number;

            //if the element is a label
            if (idElements[i].getAttribute("for"))
            {   //set the for attribute to be the next elements id
                idElements[i].setAttribute("for", idElements[i+1].classList[0] + number);
            }

        }
    }

    //sets the new id for itself
    if (element.classList.length > 0)
    {
        element.id = element.classList[0] + number;
    }
}

function collapseCard(card, doCollapse)
{
    if (doCollapse)
    {   card.children[0].classList.remove("hidden");
        for (let i = 1; i < card.children.length; i++)
        {
            card.children[i].classList.add("hidden");
        }

        editingPerson = false;
    }
    else
    {
        card.children[0].classList.add("hidden");
        for (let i = 1; i < card.children.length; i++)
        {
            card.children[i].classList.remove("hidden");
        }

        editingPerson = true;
    }
    
}

function refreshPeopleIds()
{
    for (let i = 0; i < peopleForm.children.length; i++)
    {
        refreshIdNumbers(peopleForm.children[i], i - 1);
    }
}

//Loads Event Data into event array
function loadEvents()
{
    for(let i = 0; i < NUM_EVENTS; i++)
    {
        let newEvent = new ThriveEvent;
        newEvent.id = i;
        eventArray.push(newEvent);
    }

    eventArray[0].name = "Climbing at Clifton";
    eventArray[0].description = "Join us for a fun day at Eagle's Bluff in Clifton!";
    eventArray[0].startDate = "06/29/24";
    eventArray[0].cost = 30;
    eventArray[0].tag = "Adventure";
    eventArray[0].currentSlots = 12;

    eventArray[1].name = "Marriage Retreat";
    eventArray[1].description = "Journey to Oneness";
    eventArray[1].startDate = "07/04/24";
    eventArray[1].cost = 70;
    eventArray[1].tag = "Retreat";
    eventArray[1].currentSlots = 10;

    eventArray[2].name = "Evangelism Training";
    eventArray[2].description = "Learn to evangelize";
    eventArray[2].startDate = "09/12/24";
    eventArray[2].donation = 10;
    eventArray[2].tag = "Training";
    eventArray[2].currentSlots = 0;
    eventArray[2].maxSlots = 0;

    eventArray[3].name = "Costa Rica Mission";
    eventArray[3].description = "We are working with filter of hope to give water to those in need in San Jose.";
    eventArray[3].startDate = "11/22/24";
    eventArray[3].cost = 2000;
    eventArray[3].tag = "Mission";
    eventArray[3].currentSlots = 5;

    eventArray[4].name = "Alagash Expedition";
    eventArray[4].description = "Explore the allagash on Canoe";
    eventArray[4].startDate = "12/11/24";
    eventArray[4].cost = 50;
    eventArray[4].tag = "Adventure";
    eventArray[4].currentSlots = 10;

    //refreshEvents();

}

//Adds a new event card on the list
function placeNewEventCard(eventObject)
{
    newEventElement = document.createElement("div");

    let costText = "$" + eventObject.cost;
    let slotText = eventObject.currentSlots + " Slots";

    if (eventObject.donation != 0)
    {
        costText = "By Donation"; 
    }
  
    if (eventObject.maxSlots == 0)
    {
        slotText = "";
    }

    newEventElement.innerHTML =  `  <div class = "dateInfo">${eventObject.getStartDay()}</div>
                                    <div class = "innerEvent">
                                        <h2 class = "eventTitle">${eventObject.name}</h2>
                                        <p class = "eventDescription">${eventObject.description}</p>
                                        <div class = "eventInfoBar">
                                            <div class="eventCost eventInfoItem"><span class ="eventCostNum">${costText}</span></div>
                                            <div class="eventSlots eventInfoItem"><span class = "eventSlotsNum">${slotText}</span></div>
                                            <div class="tag eventInfoItem">${eventObject.tag}</div>
                                        </div>
                                    </div>
                                    <div class = "eventButtons">
                                        <button class = "eventButton univButton selectButton">Select</button>
                                        <button class = "eventButton univButton infoButton">More Info</button>
                                    </div>`



    newEventElement.classList.add("eventCard", "sectionItem");

    newEventElement.id = "event" + eventObject.id;

    eventSelector.appendChild(newEventElement);

}

function newPersonLine()
{
    const newPersonLine = document.createElement("div");

    peopleForm.appendChild(newPersonLine);

    let newId = indexOfChild(newPersonLine);

    newPersonLine.innerHTML = `
        <div class="nameInput infoItem hasIdNum" id = "nameInput${newId}">
            <label class="nameLabel hasIdNum" for="name${newId}" id = "nameLabel${newId}">Additional Registrant</label>
            <input type="text" id = "name${newId}" name = "name" class = "name infoText hasIdNum" required/>
        </div>
        <div class="ageInput infoItem hasIdNum" id = "ageInput${newId}">
            <label class="ageLabel hasIdNum" for="age${newId}" id = "ageLabel${newId}">Age</label>
            <input type="number" id = "age${newId}" name = "age" class = "age infoText hasIdNum" min="0" max = "120" required/>
        </div>

        <div class="relationInput infoItem hasIdNum" id = "relationInput${newId}">
            <label class= "relationLabel hasIdNum" for="relation${newId}" id = "relationLabel">Relation</label>
            <select name="relation${newId}" id="relation${newId}" class = "relation infoText hasIdNum" required>
                <option hidden disabled selected value="default"> -- select -- </option>
                <option value = "Spouse">Spouse</option>
                <option value = "Child">Child</option>
                <option value = "Other">Other</option>
            </select>
        </div>

        <button type="button" class = "deletePersonButton actionButton univButton">Delete</button>`

    newPersonLine.id = "peopleFormLine" + newId;
    newPersonLine.classList.add("peopleFormLine", "hasIdNum");

}

//load (or refresh) the tool). Clears html elements, ands adds some back
function refreshApp()
{
    loadEvents();

    for(evt of eventArray)
    {
        placeNewEventCard(evt);
    }

    setFilter();
}

//new filter function. Filters which event cards should be on the page
function displayCards()
{
    //show the filter bar
    tagFilter.classList.remove("hidden");

    //loop through each of the event objects, and show the ones visible
    for (evt of eventArray)
    {
        const eventOnPage = document.querySelector("#event" + evt.id);
        if (evt.visible)
        {   //if the event is suppost to be visble, show it
            eventOnPage.classList.remove("hidden");
        }
        else
        {   //if it's hidden, don't show it
            eventOnPage.classList.add("hidden");
        }
    }
}

function setFilter(filter = "All")
{
    currentFilter = filter;
    //loop through the events, and show and hide what is needed
    for (evt of eventArray)
    {
        //if filter is valid for it, show it
        if (((evt.tag === filter || filter === "All") && currentStep === 0) || evt.selected === true)
        {
            evt.visible = true; 
        }
        else
        {
            evt.visible = false;
        }
    }

    //after the filters are set, refilter
    displayCards();
}

//takes the name and age from the person form and adds it to the person array and closes the editor
function savePersonInfo(doClose = true)
{
    let names = peopleForm.querySelectorAll(".name");
    let ages = peopleForm.querySelectorAll(".age");
    let relations = peopleForm.querySelectorAll(".relation");

    let requiredFilled = true;

    for (let i = 0; i < names.length; i++)
    {
        //if all fields are filled out
        if (!(names[i].value && ages[i].value && (relations[i].value != "" || i === 0)))
        {
            requiredFilled = false;
        }
        else{
            //if this person doesn't exist on the array yet, add it
            if (i >= personArray.length)
            {
                personArray.push(new Person);
            }

            //then set the information
            personArray[i].name = names[i].value;
            personArray[i].age = ages[i].value;
            personArray[i].relation = relations[i].value;
        }

        
        
        
    }

    
    refreshSignatureLines();
    if (requiredFilled)
    {
        let names = personArray[0].name;
        for (let i = 1; i < personArray.length; i++)
        {
             names += " | " + personArray[i].name;
        }
        peopleInfo.querySelector(".closedInfoTwo").innerText = names;
        
        if (doClose) collapseCard(peopleInfo, true);
        return true;
    }

    return false;


}

function saveContactInfo(){
    let email = contactInfo.querySelector("#email").value;
    let phoneNumber = contactInfo.querySelector("#phoneNumber").value;

    if (email && phoneNumber){
        signUpInfo.email = email;
        signUpInfo.phoneNumber = phoneNumber;

        signUpInfo.allergies = contactInfo.querySelector("#allergies").value;
        signUpInfo.church = contactInfo.querySelector("#church").value;

        collapseCard(contactInfo, true);

        contactInfo.querySelector(".closedInfoTwo").innerText = email + " | " + phoneNumber;
        
        emergencyContact.classList.remove("hidden");
        return true;
    }
    return false;
}

function saveEmergencyInfo()
{
    let name = emergencyContact.querySelector("#emName").value;
    let relation = emergencyContact.querySelector("#emRelation").value;
    let number = emergencyContact.querySelector("#emPhone").value;

    if (name && relation && number)
    {
        signUpInfo.emName = name;
        signUpInfo.emRelation = relation;
        signUpInfo.emNumber = number;

        collapseCard(emergencyContact, true);

        emergencyContact.querySelector(".closedInfoTwo").innerText = name + " | " + relation;

        waiver.classList.remove("hidden");
        return true;
    }
    return false;


}

function saveSignatureInfo()
{
    let signatureFields = signatureForm.querySelectorAll(".signature");

    let requiredFilled = true;

    for (let i = 0; i < signatureFields.length; i++)
    {
        if (signatureFields[i].value != "")
        {
            personArray[i].signature = signatureFields[i].value;
            personArray[i].signatureTimestamp = new Date;
        }
        else
        {
            requiredFilled = false;
        }
    }

    if (requiredFilled)
    {
        collapseCard(waiver, true);
        waiver.querySelector(".closedInfoTwo").innerText = "Signed: " + personArray[0].signatureTimestamp.toDateString();
        return true;
    }
    return false;

}

function refreshSignatureLines()
{
    signatureForm.innerHTML = "";

    for (let i = 0; i < personArray.length; i++)
    {
        if (personArray[i].name != "")
        {
            let newSigLine = document.createElement("div");
            newSigLine.innerHTML = `<label class = "hasIdNum" for="signature${i}" id = "signatureLabel${i}">E-Signature of ${personArray[i].name}</label>
                                    <input type="text" id = "signature${i}" name = "signature" class = "signature hasIdNum infoText" required/>`
            newSigLine.classList.add("infoItem");
            newSigLine.querySelector(".signature").value = personArray[i].signature;
            if (personArray[i].signature === "") waiver.querySelector(".closedInfoTwo").innerText = "Unsigned";
            signatureForm.appendChild(newSigLine);
        }
    
    }
}



refreshApp();