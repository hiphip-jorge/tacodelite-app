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
        {id: 1, name: "Breakfast", foodItems: {}},   
        {id: 2, name: "Tacos", foodItems: {}},       
        {id: 3, name: "Burritos", foodItems: {}},    
        {id: 4, name: "Nachos", foodItems: {}},      
        {id: 5, name: "Salads", foodItems: {}},      
        {id: 6, name: "Quesadillas", foodItems: {}}, 
        {id: 7, name: "Tostadas", foodItems: {}},    
        {id: 8, name: "Sides", foodItems: {}},       
        {id: 9, name: "Extras", foodItems: {}},      
        {id: 10, name: "Chips-n-Stuff", foodItems: {}},
        {id: 11, name: "Dinners", foodItems: {}},     
        {id: 12, name: "Family", foodItems: {}},      
        {id: 13, name: "Desserts", foodItems: {}},    
        {id: 14, name: "Drinks", foodItems: {}},    
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
  