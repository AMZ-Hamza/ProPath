# ProPath

## Introduction

ProPath est une application web de gestion et de suivi de la formation. Elle centralise dans une seule plateforme les besoins des trois profils principaux: l'administration, les formateurs et les stagiaires. L'objectif est de faciliter l'organisation pédagogique, de rendre l'information accessible en temps réel et d'améliorer le suivi du parcours de chaque stagiaire.

## Problematique

Dans plusieurs environnements de formation, les informations sont souvent dispersees entre plusieurs supports: feuilles papier, messages informels, fichiers separes ou outils non relies entre eux. Cette situation entraine des retards, des erreurs de suivi et un manque de visibilite sur l'avancement des stagiaires. ProPath apporte une solution en reunissant dans un meme espace la gestion des utilisateurs, des groupes, des matieres, des emplois du temps, des notes, des absences, des cours et des exercices.

## Methodologie

Le projet ProPath est developpe sous forme d'application web avec React pour l'interface utilisateur et React Router pour la navigation entre les espaces metier. L'application s'appuie sur un service de donnees centralise, capable de fonctionner en mode local via LocalStorage et IndexedDB, avec une structure prevue pour une integration API. La methode de travail retenue est l'approche Agile: le projet avance par iterations courtes, avec une priorisation des fonctionnalites, des validations regulieres et une amelioration continue selon les besoins du produit.

## Etat d'avancement

A ce stade, l'application dispose deja d'une base fonctionnelle solide. Un systeme d'authentification et d'initialisation est en place, avec des espaces separes pour l'administration, les formateurs et les stagiaires. L'espace administration permet de gerer les utilisateurs, les groupes, les matieres, les annonces, les emplois du temps et les parametres generaux. L'espace formateur prend en charge la saisie des notes, la gestion des absences, la publication des cours et des exercices. L'espace stagiaire permet de consulter le tableau de bord, l'emploi du temps, les ressources, les exercices, les absences et les notes. Le build de production du projet se genere correctement, ce qui confirme un bon niveau de stabilite technique. La prochaine etape logique consiste a renforcer les tests automatiques, enrichir l'experience utilisateur et connecter l'application a un backend definitif si necessaire.
