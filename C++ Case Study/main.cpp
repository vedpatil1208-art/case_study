#include <iostream>
#include <vector>
using namespace std;

// Forward declarations
class Doctor;
class Patient;
class Appointment;

int main() {

    vector<Doctor> doctors;
    vector<Patient> patients;

    int choice;

    do {
        cout << "\n===== Telemedicine Backend System =====\n";
        cout << "1. Register Doctor\n";
        cout << "2. Register Patient\n";
        cout << "3. Schedule Appointment\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        try {

            if (choice == 1) {
                int id;
                string name, specialization;

                cout << "Enter Doctor ID: ";
                cin >> id;
                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Specialization: ";
                cin >> specialization;

                Doctor d(id, name, specialization);
                doctors.push_back(d);

                cout << "Doctor Registered Successfully!\n";
            }

            else if (choice == 2) {
                int id, age;
                string name;

                cout << "Enter Patient ID: ";
                cin >> id;
                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Age: ";
                cin >> age;

                Patient p(id, name, age);
                patients.push_back(p);

                cout << "Patient Registered Successfully!\n";
            }

            else if (choice == 3) {
                int dId, pId;
                string date;

                cout << "Enter Doctor ID: ";
                cin >> dId;
                cout << "Enter Patient ID: ";
                cin >> pId;
                cout << "Enter Appointment Date: ";
                cin >> date;

                Appointment app(dId, pId, date);
                app.saveToFile();

                cout << "Appointment Scheduled & Saved!\n";
            }

            else if (choice == 4) {
                cout << "Exiting System...\n";
            }

            else {
                throw invalid_argument("Invalid choice!");
            }

        } catch (exception &e) {
            cout << "Error: " << e.what() << endl;
        }

    } while (choice != 4);

    return 0;
}#include <iostream>
#include <vector>
#include <fstream>
#include <stdexcept>
using namespace std;

// Person class
class Person {
protected:
    int id;
    string name;

public:
    Person(int id, string name) {
        this->id = id;
        this->name = name;
    }

    int getId() { return id; }
    string getName() { return name; }

    virtual void display() = 0;   // abstraction
};

// Doctor class
class Doctor : public Person {
private:
    string specialization;

public:
    Doctor(int id, string name, string specialization)
        : Person(id, name) {
        this->specialization = specialization;
    }

    void display() override {
        cout << "\nDoctor Details\n";
        cout << "ID: " << id << endl;
        cout << "Name: " << name << endl;
        cout << "Specialization: " << specialization << endl;
    }
};

// Patient class
class Patient : public Person {
private:
    int age;

public:
    Patient(int id, string name, int age)
        : Person(id, name) {
        this->age = age;
    }

    void display() override {
        cout << "\nPatient Details\n";
        cout << "ID: " << id << endl;
        cout << "Name: " << name << endl;
        cout << "Age: " << age << endl;
    }
};

// Appointment class
class Appointment {
private:
    int doctorId;
    int patientId;
    string date;

public:
    Appointment(int dId, int pId, string date) {
        doctorId = dId;
        patientId = pId;
        this->date = date;
    }

    void saveToFile() {
        ofstream file("records.txt", ios::app);

        if (!file) {
            throw runtime_error("File error!");
        }

        file << "Doctor ID: " << doctorId
             << " | Patient ID: " << patientId
             << " | Date: " << date << endl;

        file.close();
    }
};

// Main function
int main() {

    vector<Doctor> doctors;
    vector<Patient> patients;

    int choice;

    do {
        cout << "\nTelemedicine Backend System\n";
        cout << "1. Register Doctor\n";
        cout << "2. Register Patient\n";
        cout << "3. Schedule Appointment\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        try {

            if (choice == 1) {
                int id;
                string name, specialization;

                cout << "Enter Doctor ID: ";
                cin >> id;
                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Specialization: ";
                cin >> specialization;

                doctors.push_back(Doctor(id, name, specialization));
                cout << "Doctor Registered Successfully!\n";
            }

            else if (choice == 2) {
                int id, age;
                string name;

                cout << "Enter Patient ID: ";
                cin >> id;
                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Age: ";
                cin >> age;

                patients.push_back(Patient(id, name, age));
                cout << "Patient Registered Successfully!\n";
            }

            else if (choice == 3) {
                int dId, pId;
                string date;

                cout << "Enter Doctor ID: ";
                cin >> dId;
                cout << "Enter Patient ID: ";
                cin >> pId;
                cout << "Enter Appointment Date: ";
                cin >> date;

                Appointment app(dId, pId, date);
                app.saveToFile();

                cout << "Appointment Scheduled Successfully!\n";
            }

            else if (choice == 4) {
                cout << "Exiting...\n";
            }

            else {
                throw invalid_argument("Invalid choice!");
            }

        } catch (exception &e) {
            cout << "Error: " << e.what() << endl;
        }

    } while (choice != 4);

    return 0;
}