# Gym-Management-System

Gym Management System
Project Overview
The Gym Management System is a web-based application developed using HTML, CSS, JavaScript, and Firebase Firestore to automate gym operations and management activities.
The system provides separate dashboards for Admin, Staff, and Customer (Member) roles.
It helps gym administrators manage members, attendance, payments, staff details, diet plans, announcements, and reports efficiently.
The application ensures secure role-based login, real-time database updates, and an interactive dashboard for monitoring gym activities.
________________________________________
Files in the Project
Authentication
• login.html – Role-based login interface
• login.css – Login page styling
• login.js – Authentication and role verification
Admin Module
• admin.html – Admin dashboard layout
• admin.css – Admin panel styling
• admin.js – Member, staff, payment and report management
Customer Module
• customer.html – Customer dashboard
• customer.css – Customer interface styling
• customer.js – Customer activity handling
Configuration
• firebase.js – Firebase configuration
• README.md – Project documentation
________________________________________
How to Run the Application
1.	Download or clone the project repository.
2.	Open project folder using VS Code.
3.	Create a Firebase project from Firebase Console.
4.	Enable:
o	Cloud Firestore Database
5.	Add Firebase configuration inside firebase.js file.
6.	Create required Firestore collections.
7.	Run the project using Live Server.
8.	Open login.html in browser.
________________________________________
User Roles in System
Admin
• Manage gym members
• Track membership expiry
• Manage attendance
• Handle payments
• Manage staff details
• Add diet & membership plans
• Publish announcements
• Generate reports and analytics
Customer (Member)
• View dashboard information
• Track attendance
• Receive reminders
• View announcements
• Monitor personal gym reports
• Access daily task reminders
Staff
• Login access
• Attendance monitoring
• Member interaction support
________________________________________
Application Modules
1. Authentication Module
• Role-based login system
• Admin / Customer / Staff login
• Credential validation using Firestore
• Session storage using LocalStorage
________________________________________
2. Dashboard Module
• Active member statistics
• Expired memberships
• Payment reminders
• Staff count
• Earnings visualization
• Charts using Chart.js
________________________________________
3. Member Management
• Register new members
• Edit and delete members
• Membership tracking
• Member progress monitoring
• Status management
________________________________________
4. Attendance Management
• Member check-in/check-out
• Staff attendance tracking
• Daily attendance storage
________________________________________
5. Payment Management
• Membership payment records
• Payment history tracking
• Renewal monitoring
________________________________________
6. Staff Management
• Add new staff
• Remove staff
• Store login credentials
• Position management
________________________________________
7. Diet & Membership Plans
• View diet plans
• Membership plan management
• Plan duration handling
________________________________________
8. Announcement System
• Publish gym announcements
• Display announcements to members
• Date-based notifications
________________________________________
9. Report & Analytics
• Monthly reports
• Member growth visualization
• Chart-based analytics dashboard
________________________________________
Key Features
• Role-based login system
• Firebase Firestore database integration
• Admin dashboard analytics
• Membership expiry reminders
• Attendance tracking system
• Payment monitoring
• Staff management
• Announcement system
• Responsive modern UI
• Secure session handling using LocalStorage
• Real-time data updates
________________________________________
Technologies Used
• HTML5
• CSS3
• JavaScript (ES6 Modules)
• Firebase Firestore
• Chart.js
• jsPDF
________________________________________
Firestore Database Structure
admin
→ adminId
  username
  password
members
→ memberId
  name
  address
  contact
  username
  password
  plan
  status
  join
  lastPaymentDate
staff
→ staffId
  name
  contact
  position
  username
  password
attendance
→ attendanceId
  memberId
  name
  status
  date
  time
payments
→ paymentId
  name
  amount
  date
membershipPlans
→ planId
  name
  duration
  price
dietPlans
→ dietId
  name
announcements
→ announcementId
  text
  date
reminders
→ reminderId
  name
  message
  date
________________________________________
Testing
The system was tested for:
• Login authentication
• Role validation
• Member registration
• Attendance recording
• Payment tracking
• Membership expiry alerts
• Staff operations
• Announcement publishing
• Dashboard analytics
________________________________________
Conclusion
The Gym Management System successfully digitizes gym administration processes by providing centralized control over members, staff, attendance, and payments.
The project demonstrates practical implementation of:
• Role-Based Access Control
• Cloud Database Integration
• Dashboard Analytics
• Real-time Data Management
• Modern Web Application Development
