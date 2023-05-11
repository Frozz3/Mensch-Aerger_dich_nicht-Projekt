# Mensch-Aerger_dich_nicht-Projekt

Anleitung zum deployen (aufsetzten der Seite auf Lokalem Server):

Schritt 1: Git herunterladen.

Schritt 2: Git Repository "Mensch_Ärger_dich_nicht-Projekt" (Clonen) in einem Ordner speichern.

Schritt 3: Node.js herunterladen.

Schritt 4: Datenbank "lfup" erstellen 

Schritt 5: lfupv3 (Server Ordner) importieren.

Schritt 6: "nmp i" in der Konsole eingeben um Pakete herunterzuladen.

Schritt 7: Dotenv (.env) Datei erstellen und folgenden Daten eintragen (WICHTIG: Im Projekt Ordner nicht in einem Unterordner).

env Inhalt:

 #Datenbank HOST                   
DBHOST="127.0.0.1"   

#Datenbank Benutzer   
DBUSER="root"      

#Datenbank Passwort                   
DBPASSWORD=""  

#Datenbank Name                   
DBNAME ="lfup"   

#Datenbank Port                   
DBPORT="3306"  

#Server Port  
PORT="80"     

IS_HTTPS="false"
HTTPS_KEY_PATH=""               
HTTPS_CERT_PATH=""

Schritt 9: XAAMP: nur mySQL Starten.

Schritt 10: in Konsole "node ./server/index.mjs" eintragen um Server zu starten.   
Wenn Anmeldung benötigt wird:     
username = username    
password = password





