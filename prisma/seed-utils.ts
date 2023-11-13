import bcrypt from "bcryptjs";

export async function getUsers() {
    const users = {Javier : {
        email: "tacodelitewestplano@gmail.com",
        password: await bcrypt.hash("javieriscool", 10)
    }, Jorge: {
        email: "jorgeperez.inbox@gmail.com",
        password: await bcrypt.hash("jorgeiscool", 10)
    }}

    return [users["Javier"], users["Jorge"]];
}
  
  
  
export function getCategory() {
    return [                    
        {id: 1, name: "Breakfast", food_items: []},   
        {id: 2, name: "Tacos", food_items: []},       
        {id: 3, name: "Burritos", food_items: []},    
        {id: 4, name: "Nachos", food_items: []},      
        {id: 5, name: "Salads", food_items: []},      
        {id: 6, name: "Quesadillas", food_items: []}, 
        {id: 7, name: "Tostadas", food_items: []},    
        {id: 8, name: "Sides", food_items: []},       
        {id: 9, name: "Extras", food_items: []},      
        {id: 10, name: "Chips-n-Stuff", food_items: []},
        {id: 11, name: "Dinners", food_items: []},     
        {id: 12, name: "Family", food_items: []},      
        {id: 13, name: "Desserts", food_items: []},    
        {id: 14, name: "Drinks", food_items: []},    
    ]
}
  
export function getAnnouncement() {
    return [
        {startDate: new Date(),
        endDate:  new Date('January 30, 2023'),
        message: "First Announcement of Taco Delite",
        }
    ]
}
  