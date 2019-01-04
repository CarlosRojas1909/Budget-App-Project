// module budget
var  budgetController = (function(){

    //creating 2 functions constructors one for income and another for expenses. constructor names with uppercase
    var Expense = function (id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percenage = -1;
    };
    //creating a method prototype for Expenses.we dont add it inside Expenses Object bc we dont want all our object to have that method as property. we would be repeating ourself
    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome)*100)
        } else {
            this.percenage = -1
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    //Creating a method to calculate total income and expenses
    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        
        })
        data.totals[type] = sum;
    }

    //we need to store all our object somewhere in this case arrays {{[exp...{}...],[inc...{}...]},{0,0}}
    var data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0, //this variable hold the value of all our expenses;
                inc: 0 // this variable hold the value of all our incomes;
            },
            budget: 0,
            percentage: -1 // is a value to set -1 to tell a value is not existant in web development for %.
    };

    return   {

            addItem: function(type, des, val) { // down below we are passing an object that is save in input variable(input.type, input.description, input.value)

                    var newItem, ID;//ID is basically the index in an array to keep track of what element we are deleting later on

                    if (data.allItems[type].length > 0){
                        //Create new ID
                        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;// in a array it will be equal to last item + 1.don't confuse is with database id in Mongo
                        
                    } else {
                        ID = 0;   
                    }

                    //Create new item based on 'inc' or 'exp' type    
                    if (type === 'exp') {
                            newItem = new Expense(ID, des, val);

                    } else if (type === 'inc') {
                            newItem = new Income(ID, des, val);
                    }
                    //Push it into our data structure
                    data.allItems[type].push(newItem);

                    //Return the new element to be public
                    return newItem; //we are returning newItem bc we are using it later down below so it needs to be public;
            },
            // method to delete item
            deleteItem: function(type, id) {
                var ids, index;

                ids = data.allItems[type].map(function(current){ //parameter same as forEach(current, index, whole array)
                    return current.id// this id is  property of each elememt objecet inside inc or exp array this will return an array with all the id in each obeject inside exp or inc array
                });

                index = ids.indexOf(id);// if indexOf cant find the element in the array will return -1

                if(index !== -1) {

                    data.allItems[type].splice(index, 1);//splice(starting point, # element to delete) will delete element in array and will return the same array but with deleted elements,splice modifies the original array, different than slice() that  won't modify the array ,will return a copy of an array with modification depending of what i want

                }

            },

            calculateBudget: function() {
                //calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');
                //calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;
                // calculate the percentage of income that we spent.we need to do this calculation only when we have some income 
                if (data.totals.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); //Math.round , rounds a number to a closer integer

                } else {
                    data.percentage = -1;
                }
            },
            //function to calculate percentages on the top part of our webpage
            calculatePercentages: function() {

                data.allItems.exp.forEach(function(cur){//this method goes through exp array and assigns a           percentaage property to each array created by constructor
                    cur.calcPercentage(data.totals.inc);// this will call the method in the object we created entering input this method in the protype property
                })
            },

            getPercentages: function() {

                var allPerc = data.allItems.exp.map(function(cur) { //map() creae a new array with alter values on elements
                    return cur.getPercentage(); //we are returning an new array with all percentage property created with expense constructor. 
                })
                return allPerc;
            },
            //this method is just  return data from our module so we get used to the philosophy to have a functions doing onl one thing. we are returning 4 values , budget, totals.inc totals.exp and percentage,we put all in an object
            getBudget: function() {

                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },
            //we are creating this method to test our project if our data object is getting all the input pushed inside arrays
            testing: function() {
                    console.log(data)
            }
    }

})();

// module UI
var UIController = (function(){

    //we are creating and object to save further trouble when we want to change let's say the same if the class in  the DOM 
    var DOMstrings = {
            inputType:  '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            dateLabel: '.budget__title--month'
    };

    //creating a private method bc we dont need to use it outside of this module
    var formatNumber = function(num, type){
        var numSplit, int, dec;
         /*
         2310.4567 -> +2,310.46
         2000 -> + 2,000.00 
         */
        // num variable is being override over on different occasions!
         num = Math.abs(num); // Math.abs it takes the sign(+ or -). it returns the absolute value of a number on a number, num varaible is a number.
         num = num.toFixed(2); // Number.toFixed add .00 the the number or also rounded it its decimal part  2.4567 -> 2.46...2 -> 2.00, keep in mind the num variable is a number , when we apply .to.Fixed() string function the result is a  STRING! the basically formats a number to string.     

         // splitting the num and store it in an array. we are using split() for this
         numSplit = num.split('.'); //we are splitting the number at . decimal, the result is a string
         int = numSplit[0];

         if (int.length > 3) {

            /* .substr(start index, # of elements) method returns a portion of the string this method is almost deprecated, MDN suggests to use subSring()method better  but there is a difference on the second paremeter, index of the last element we will exclude.
            var str = 'Mozilla';
            console.log(str.substring(1, 3));
            // expected output: "oz"
             */
            int = int.substring(0, int.length-3) + ',' + int.substring(int.length-3) //input 23510 output 23,510, if not add second parameter will return whats left after and from our first parameter
            //int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3) //input 23510 output 23,510 // on the way to be deprecated

         }

         dec = numSplit[1];

         return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    //this code was moved to here to be able to use it in other places

    var nodeListForEach = function(nodelist, callback){ // list parameter and callback here areplaceholders for our NodeList//this is a FIRST CLASS FUNCTION bc function are treated as arguments, we do this so we can use this function many times intead of forEach function 
        for (var i = 0; i < nodelist.length; i++){

            callback(nodelist[i], i) // list[i] is current value in the array looping through, i is the index of the element
        }
    };
       

    //have to return whatever i want to be public, in this case will be public for controller module uses it
    return {
            getInput: function() {

                 // controller module is gonna need this 3 values so the best way to send these 3 values are in a object
                return {
                   
                     type: document.querySelector(DOMstrings.inputType).value,// will be either inc or exp
                     description: document.querySelector(DOMstrings.inputDescription).value,
                     value: parseFloat(document.querySelector(DOMstrings.inputValue).value)//value is string so we have to make it a number ,we use parseFlot that convert a string to a number but keeps the decimals also
                };
                    
            },
            //creating new method to insert html inside DOM.
            addListItem: function(obj, type) { 
                var html, newHtml,element;

                if (type === 'inc') {
                        //Create HTML string with placeholder text
                     element = DOMstrings.incomeContainer;
                                // we replace income- o for income-%id%, the % at the beginning and end of id are set there so its easy to find int the placeholder and it won't override anything we don't want , we do the same with description and value
                     html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                         
                } else if (type === 'exp') {
                      element = DOMstrings.expensesContainer;

                      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';  
                }
               
                //Replace the placeholder text with some actual data
                //as in arrays , strings have a bunch of methods like replace(what to replace, element to place instead), html variable is a string
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type)); //formatNumber method was apply here at the end of the project to adjust some data.
                

                //Insert the HTML into the DOM;
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },
            //mothod to delete element from the DOM
            deleteListItem: function(selectorID) {
                // to remove a child element form DOM first we need to get the parent. in jvascript you ca only remove childs.selectorID is the element we want to remove
                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

            //Creating a methods to clear fields after submitting our inputs
            clearFields: function () {
                var fields, fieldsArr;    

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
                //console.log(fields) will result NodeList(2) [input.add_description, input.add__value] and this is not an array, it looks like an array but it's NOT. it's a type of list that looks like an array. we need to make it an actual array so we are gonnna borrow an Array method.this is a very common trick
                fieldsArr = Array.prototype.slice.call (fields);
               
                fieldsArr.forEach(function(current, index, array) {// forEach can take to up to  arrays,first is each element in the array,second is index of each element, third is the whole array
                        current.value = '';
                        
                });
                //set the focus on the first field after we finish entering inputs,
                fieldsArr[0].focus();

            },

            displayBudget: function(obj) {
                var type;
                obj.budget > 0 ? type = 'inc' : type = 'exp';
                
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                
                if (obj.percentage > 0) {

                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }
            },

            //here we are learning to create our own forEach loop for an NODE list, not for an array. this is very important!!!!
            displayPercentage: function(percentage) {//pecentage here is just a variable that's gonna hold an array 

                    var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // fields holds  value of a Node list(looks like an array but it's NOT!)
/* had to move this code to somewhere else to be able to use it , right now we can't access it bc of scope issues!!!
                    //creating a function inside this method this is our first step to create a forEach function applying it to an NodeList(not a arrayS!!!)
                    var nodeListForEach = function(nodelist, callback){ // list parameter and callback here areplaceholders for our NodeList//this is a FIRST CLASS FUNCTION bc function are treated as arguments, we do this so we can use this function many times intead of forEach function 
                        for (var i = 0; i < nodelist.length; i++){

                            callback(nodelist[i], i) // list[i] is current value in the array looping through, i is the index of the element
                        }
                    };
*/                    
                    //here we are gonna call our function nodeListForEach and passong the 2 arguments 
                    nodeListForEach(fields, function(current, index){ //current hold value of list[i] and index the value of i.

                        if (percentage[index] > 0) {

                            current.textContent = percentage[index] + '%';

                        } else {

                            current.textContent = '---';
                        }

                            

                    });
            },

            //method to display date in the UI
            displayMonth: function() {

                var now, month, year;

                now = new Date() // new Date() is a function constructor it will give us the complete date
                
                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                month = now.getMonth();// returns the month according to local time as a zero based value(January =0 February=1..etc)

                year = now.getFullYear();//returns only the year nothing else.
                document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

            },
            // here we are creating method to change color of input fields depending if expense or income
            changedType: function() {
                //targeting 3 input fields but not the button, fields variable will return a NodeList 
                var fields = document.querySelectorAll(DOMstrings.inputType + ',' +
                                                       DOMstrings.inputDescription + ',' +
                                                       DOMstrings.inputValue);
                
                nodeListForEach(fields, function(cur) {// int he function we don't need the index parameter
                    cur.classList.toggle('red-focus');
                });
                //targeting the button to change color depending on if expense or income
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

            },

            //creating a method to make DOMstrings objet public so controller module can use it
            getDOMstrings: function () {
                return DOMstrings;
            }
    }

})();


// module controller of both budget and UI
var controller = (function(budgetCtrl, UICtrl){

    //creating a function to group all our event listeners orginized
    var setupEventListeners = function () {

            // DOMstrings object was bring to this module and assigned to a variable called DOM
            var DOM = UICtrl.getDOMstrings();

            //creating an event handler for the check button(green incon)
            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

            //creating a event handler for when the enter key i pressed so we taget this event to the global document
            document.addEventListener('keypress', function(event){
        
                    if (event.keyCode === 13 || event.which ===13) {
            
                            ctrlAddItem();
                    }
            });

            //setup for event delegation
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

            //improving our UI experience/ changing color of fields to red when expense or blue when income
            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    //Creating another method to update our budget in the top part of the UI
    var updateBudget = function() {

        //Calculate the budget
        budgetCtrl.calculateBudget();
        //Return the budget
        var budget = budgetCtrl.getBudget();
        // Display the budget on the UI--- console.log(budget)
        UICtrl.displayBudget(budget);
    };  

    //functiont calculate the percentage
    var updatePercentages = function() {

        // Calculate percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from the budget controller
        var percentage = budgetCtrl.getPercentages(); // percentage hold an array with all the percentage of each object created through our constructor

        //Update the UI with the new percentages
        UICtrl.displayPercentage(percentage);

    }
    


    //pressing enter key or check button will do the same thing for both events, both events handlers will have the same code we can repeat  over it will go against "don't repeat yourself principl".so we create a new function
    var ctrlAddItem = function () { //every time i click on check icon or press enter this executes

        var input, newItem;

         //Get the field input data(description and value)
        input = UICtrl.getInput(); //this variable hold the object with description and value we entered in fields

        //adding a condition to eliminate input with empty fields or value inputs of zero
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
                 //Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value)//newItem hold the new objects created by construtor up there in budgetController
        
                //Add the item to the UI
                UICtrl.addListItem(newItem, input.type);
        
                //Clear the fields inputs 
                UICtrl.clearFields();
                
                //calculate and update budget
                updateBudget();

                //calculate  and update percentages
                updatePercentages();
        }
       
    };
    // function to delete item
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, typeSplit, idSplit;

            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;//this is called DOM treversing, going up in           the dom to find the parent of what we want to delete thorough id class we assigned to the html element.the result of itemID will be inc-number or exp- number
            if (itemID) {

                //itemID = inc-1 for example. using split('-') it will result in an array ['inc', '1'] strings inside
                splitID = itemID.split('-'); //applying split() to a string and get an array as result with split elements
                typeSplit = splitID[0]; // it can be 'inc' or 'exp' 
                idSplit = parseInt(splitID[1]); //this can be 0 or 1 or 2 etc,this is a string,need to make it a number

                // delete the item from the data structure
                budgetCtrl.deleteItem(typeSplit, idSplit);
                // delete the item from the UI
                UICtrl.deleteListItem(itemID)
                //update and show the new budget
                updateBudget();

                //calculate nd update percentages
                updatePercentages();
            }
    }

    // IIFE will run module controller and there is nothing to return, nothing is public yet

    return  {

            init: function() { //to initializse our event listeners now we need to call init function from outside
                console.log('Application had started.');
                UICtrl.displayMonth();
                UICtrl.displayBudget({  //we call this method also here be we want to reset everything to Zero at the begining
                    budget: 0,          
                    totalInc: 0,
                    totalExp: 0,
                    percenage: 0
                });
                setupEventListeners();
            }
    }

})(budgetController, UIController);

controller.init();



