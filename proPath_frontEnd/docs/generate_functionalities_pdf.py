from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "ProPath_Guide_des_fonctionnalites.pdf"


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=colors.HexColor("#12355b"),
            spaceAfter=14,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#4b5563"),
            spaceAfter=18,
        ),
        "h1": ParagraphStyle(
            "Heading1Custom",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=22,
            textColor=colors.HexColor("#12355b"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "Heading2Custom",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#2563eb"),
            spaceBefore=10,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "BodyCustom",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=13,
            textColor=colors.HexColor("#111827"),
            spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#374151"),
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12.5,
            leftIndent=12,
            firstLineIndent=-8,
            spaceAfter=3,
        ),
    }


S = styles()


def p(text, style="body"):
    return Paragraph(text, S[style])


def section(title):
    return [p(title, "h1")]


def subsection(title):
    return [p(title, "h2")]


def bullets(items):
    return [p(f"- {item}", "bullet") for item in items]


def table(rows, widths=None):
    t = Table(rows, colWidths=widths, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f0ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#12355b")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.3),
                ("LEADING", (0, 0), (-1, -1), 10.5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def build_story():
    story = []

    story += [
        p("ProPath", "title"),
        p("Guide des fonctionnalites de l'application", "h1"),
        p(
            "Ce document explique le fonctionnement de ProPath: connexion, configuration, "
            "espace administration, espace formateur, espace stagiaire, gestion des donnees "
            "et role du backend Laravel.",
            "subtitle",
        ),
        p(f"Version du document: {date.today().isoformat()}", "small"),
        Spacer(1, 0.6 * cm),
        table(
            [
                [p("Profil", "small"), p("Objectif principal", "small")],
                [p("Administration", "small"), p("Configurer la plateforme, gerer les comptes, les groupes, les matieres, les annonces et les emplois du temps.", "small")],
                [p("Formateur", "small"), p("Suivre ses groupes, saisir les notes, marquer les absences et publier les supports pedagogiques.", "small")],
                [p("Stagiaire", "small"), p("Consulter son tableau de bord, son emploi du temps, ses cours, ses exercices, ses absences et ses notes.", "small")],
            ],
            [4 * cm, 12 * cm],
        ),
        PageBreak(),
    ]

    story += section("1. Vue generale")
    story += [
        p(
            "ProPath est une application web de gestion de formation. Elle separe les fonctionnalites "
            "selon trois roles: administrateur, formateur et stagiaire. Chaque utilisateur est redirige "
            "vers son espace apres connexion.",
        ),
        p(
            "Le frontend est construit avec React et React Router. Le backend Laravel expose une API "
            "securisee par Sanctum. Quand aucune URL API n'est configuree, le frontend peut fonctionner "
            "en mode local avec LocalStorage et IndexedDB.",
        ),
    ]

    story += section("2. Demarrage, configuration et connexion")
    story += subsection("Configuration initiale")
    story += bullets(
        [
            "Au premier lancement, si aucun utilisateur n'existe, l'application affiche l'ecran de setup.",
            "L'administrateur renseigne le nom de la plateforme, son nom, son identifiant, son email et son mot de passe.",
            "Apres validation, le premier compte administrateur est cree et l'utilisateur est envoye vers l'espace administration.",
        ]
    )
    story += subsection("Connexion")
    story += bullets(
        [
            "L'utilisateur saisit son nom d'utilisateur et son mot de passe.",
            "Le systeme verifie les identifiants via le service de donnees ou l'API backend.",
            "La session est memorisee dans le navigateur sous la cle propath.session.v3.",
            "La redirection depend du role: /admin pour l'administration, /trainer pour le formateur, /stagiere pour le stagiaire.",
        ]
    )
    story += subsection("Protection des espaces")
    story += bullets(
        [
            "Un utilisateur non connecte est renvoye vers la page de connexion.",
            "Un utilisateur connecte ne peut pas ouvrir un espace qui ne correspond pas a son role.",
            "Le bouton de deconnexion supprime la session locale et renvoie vers la connexion.",
        ]
    )

    story += section("3. Espace Administration")
    story += [
        p(
            "L'espace administration sert a piloter la plateforme. Il contient un menu lateral avec les sections "
            "Tableau de bord, Utilisateurs, Structure, Matieres, Absences, Annonces, Emplois du temps et Parametres.",
        )
    ]
    story += subsection("Tableau de bord")
    story += bullets(
        [
            "Affiche des statistiques: total utilisateurs, stagiaires, formateurs, administrateurs, groupes et matieres.",
            "Signale les elements manquants de la configuration: absence de groupes, matieres, stagiaires ou emplois du temps.",
            "Affiche les derniers communiques publies pour donner une vue rapide de l'activite.",
        ]
    )
    story += subsection("Gestion des utilisateurs")
    story += bullets(
        [
            "Permet de rechercher un compte par nom, identifiant ou email.",
            "Permet de filtrer par role: administration, formateur ou stagiaire.",
            "Permet de creer un utilisateur avec nom, identifiant, email, mot de passe, role et statut actif.",
            "Pour un stagiaire, l'administrateur doit choisir le groupe; le systeme rattache aussi la branche du groupe.",
            "Permet de modifier un compte, changer son role, le desactiver ou changer son mot de passe.",
            "Permet de supprimer un compte apres confirmation.",
        ]
    )
    story += subsection("Structure: branches et groupes")
    story += bullets(
        [
            "Les branches representent les filieres ou departements de formation.",
            "Chaque branche contient un nom, un code et une description.",
            "Les groupes representent les classes ou promotions rattachees a une branche.",
            "Un groupe peut avoir une annee, une capacite et une description.",
            "Les branches et groupes peuvent etre crees, modifies et supprimes.",
        ]
    )
    story += subsection("Matieres")
    story += bullets(
        [
            "Permet de creer une matiere avec nom, code et description.",
            "Chaque matiere peut etre affectee a un formateur.",
            "Chaque matiere peut etre liee a un ou plusieurs groupes.",
            "Ces liaisons determinent ce que le formateur voit dans son espace et ce que le stagiaire voit dans ses cours et notes.",
        ]
    )
    story += subsection("Suivi des absences")
    story += bullets(
        [
            "L'administration choisit un groupe pour consulter le rapport d'absence.",
            "Le rapport vient de l'endpoint backend /admin/absence-report/{group_id}.",
            "Cette section sert a centraliser les absences enregistrees par les formateurs et a suivre les stagiaires a risque.",
            "Les parametres de duree d'une seance influencent le calcul des heures d'absence.",
        ]
    )
    story += subsection("Annonces")
    story += bullets(
        [
            "Permet de publier une annonce avec titre, contenu et public cible.",
            "Le public cible peut etre tout le monde, les stagiaires, les formateurs ou l'administration.",
            "Les annonces sont listees avec leur date de publication.",
            "L'administrateur peut modifier ou supprimer une annonce.",
            "Les annonces destinees aux formateurs et stagiaires apparaissent dans leurs tableaux de bord.",
        ]
    )
    story += subsection("Emplois du temps")
    story += bullets(
        [
            "Permet d'uploader une image d'emploi du temps.",
            "Le planning peut cibler un groupe ou un formateur.",
            "Un nouveau planning remplace le planning existant pour la meme cible en mode local.",
            "Les formateurs voient leur planning personnel; les stagiaires voient le planning de leur groupe.",
            "Les plannings publies peuvent etre supprimes par l'administration.",
        ]
    )
    story += subsection("Parametres")
    story += bullets(
        [
            "Permet de modifier le nom de la plateforme, le nom de l'institut et l'email de support.",
            "Permet de regler le nombre d'heures d'absence par seance.",
            "Permet de gerer les creneaux horaires: nom, heure de debut et heure de fin.",
            "Ces creneaux sont utilises dans la saisie de presence des formateurs.",
        ]
    )

    story += section("4. Espace Formateur")
    story += [
        p(
            "L'espace formateur donne au formateur les outils de suivi pedagogique pour les groupes et matieres "
            "qui lui sont affectes par l'administration.",
        )
    ]
    story += subsection("Vue d'ensemble")
    story += bullets(
        [
            "Affiche le nombre de groupes, matieres, cours publies et exercices publies.",
            "Affiche les annonces de l'administration destinees aux formateurs.",
            "Affiche l'emploi du temps personnel si l'administration l'a publie.",
            "Le formateur peut telecharger son emploi du temps sous forme d'image.",
        ]
    )
    story += subsection("Saisie des notes")
    story += bullets(
        [
            "Le formateur choisit un groupe puis une matiere disponible pour ce groupe.",
            "La liste des stagiaires du groupe s'affiche.",
            "Le formateur saisit CC1, CC2, CC3 et EFM.",
            "CC2 et CC3 sont optionnels; EFM est saisi sur 40 et normalise sur 20.",
            "La moyenne finale est calculee avec la formule: EFM normalise * 75% + moyenne CC * 25%.",
            "Le bouton de sauvegarde enregistre les notes pour chaque stagiaire.",
        ]
    )
    story += subsection("Presence et absences")
    story += bullets(
        [
            "Le formateur choisit un groupe, une date et un creneau horaire.",
            "Chaque stagiaire est marque present par defaut.",
            "Le formateur peut basculer chaque ligne entre present et absent.",
            "La sauvegarde cree ou met a jour les enregistrements de presence pour la date et la seance.",
            "Ces donnees alimentent ensuite le suivi d'absence dans l'espace administration et l'espace stagiaire.",
        ]
    )
    story += subsection("Publication des cours")
    story += bullets(
        [
            "Le formateur renseigne un titre, un groupe, une matiere et des notes.",
            "Il joint un fichier PDF.",
            "Le cours est publie pour le groupe et la matiere selectionnes.",
            "Le formateur peut ouvrir, telecharger ou supprimer un cours publie.",
            "Les stagiaires du groupe retrouvent ces cours dans leur section Ressources.",
        ]
    )
    story += subsection("Publication des exercices")
    story += bullets(
        [
            "Le formateur renseigne un titre, un groupe, une matiere, une date limite et une description.",
            "Il peut joindre un fichier PDF.",
            "L'exercice devient visible pour les stagiaires du groupe.",
            "Le formateur peut supprimer un exercice publie.",
        ]
    )

    story += section("5. Espace Stagiaire")
    story += [
        p(
            "L'espace stagiaire est centre sur la consultation. Le stagiaire ne modifie pas les donnees pedagogiques; "
            "il consulte les informations qui concernent son groupe et son profil.",
        )
    ]
    story += subsection("Tableau de bord")
    story += bullets(
        [
            "Affiche un resume personnel du stagiaire.",
            "Affiche les annonces ciblees vers les stagiaires.",
            "Met en avant les exercices proches ou recents.",
            "Donne un acces rapide aux cours, absences et notes.",
        ]
    )
    story += subsection("Emploi du temps")
    story += bullets(
        [
            "Recherche le planning publie pour le groupe du stagiaire.",
            "Affiche l'image du planning si elle existe.",
            "Permet au stagiaire de consulter son organisation hebdomadaire depuis son espace.",
        ]
    )
    story += subsection("Cours / Ressources")
    story += bullets(
        [
            "Affiche les cours publies par les formateurs pour le groupe du stagiaire.",
            "Chaque ressource presente le titre, la matiere, le groupe et les notes du formateur.",
            "Le stagiaire peut ouvrir ou telecharger le fichier PDF.",
        ]
    )
    story += subsection("Exercices")
    story += bullets(
        [
            "Affiche les exercices publies pour le groupe du stagiaire.",
            "Montre la matiere, la description et la date limite quand elle existe.",
            "Permet de telecharger le fichier joint si l'exercice en possede un.",
        ]
    )
    story += subsection("Absences")
    story += bullets(
        [
            "Regroupe les enregistrements de presence par date.",
            "Affiche chaque creneau horaire avec le statut present ou absent.",
            "Permet au stagiaire de suivre son historique d'absence.",
            "Le calcul depend des seances sauvegardees par les formateurs.",
        ]
    )
    story += subsection("Notes")
    story += bullets(
        [
            "Affiche les matieres du groupe du stagiaire.",
            "Montre CC1, CC2, CC3, EFM et la moyenne finale pour chaque matiere.",
            "La moyenne finale utilise la meme formule que l'espace formateur.",
            "Les notes deviennent visibles apres sauvegarde par le formateur ou l'administration via l'API.",
        ]
    )

    story += section("6. Gestion des donnees")
    story += subsection("Mode local")
    story += bullets(
        [
            "Si REACT_APP_API_URL n'est pas renseignee, l'application utilise une base locale dans le navigateur.",
            "Les donnees principales sont stockees dans LocalStorage sous propath.database.v3.",
            "Les fichiers volumineux sont deplaces vers IndexedDB pour eviter de saturer LocalStorage.",
            "Ce mode est pratique pour une demonstration ou un prototype sans serveur.",
        ]
    )
    story += subsection("Mode API")
    story += bullets(
        [
            "Si REACT_APP_API_URL est configuree, le frontend appelle le backend Laravel.",
            "Les appels authentifies ajoutent le token Bearer recu a la connexion.",
            "Le backend gere les routes de setup, login, utilisateurs, groupes, matieres, notes, presences, cours, exercices, annonces, plannings et assets.",
        ]
    )
    story += subsection("Fichiers et assets")
    story += bullets(
        [
            "Les cours et exercices peuvent contenir des PDF.",
            "Les emplois du temps sont des images.",
            "En mode backend, les fichiers passent par le controleur AssetController et peuvent etre affiches ou telecharges.",
            "En mode local, les fichiers sont gardes sous forme de data URL ou reference IndexedDB.",
        ]
    )

    story += section("7. Backend Laravel et API")
    story += [
        p(
            "Le backend est organise autour de controleurs API versionnes. Les routes publiques concernent le setup, "
            "la connexion et l'etat de demarrage. Les autres routes sont protegees par auth:sanctum et, pour certaines, "
            "par un middleware de role.",
        )
    ]
    story += [
        table(
            [
                [p("Module", "small"), p("Fonction", "small")],
                [p("AuthController", "small"), p("Setup initial, login, logout et utilisateur connecte.", "small")],
                [p("SettingsController", "small"), p("Lecture et mise a jour des parametres de plateforme.", "small")],
                [p("UserController", "small"), p("CRUD des comptes par l'administration.", "small")],
                [p("StudentController", "small"), p("Profil stagiaire, liste, notes et resume d'assiduite.", "small")],
                [p("TrainerController", "small"), p("Groupes et matieres affectes a un formateur.", "small")],
                [p("Branch / Group / Subject", "small"), p("Structure pedagogique: filieres, groupes et matieres.", "small")],
                [p("AttendanceController", "small"), p("Consultation et sauvegarde en lot de la presence.", "small")],
                [p("GradeController", "small"), p("Saisie en lot et consultation des notes.", "small")],
                [p("Lesson / Exercise", "small"), p("Publication des cours et exercices.", "small")],
                [p("AnnouncementController", "small"), p("Annonces et filtrage par public.", "small")],
                [p("TimetableController", "small"), p("Publication et suppression des emplois du temps.", "small")],
                [p("AssetController", "small"), p("Upload, affichage et telechargement des fichiers.", "small")],
                [p("DashboardController", "small"), p("Donnees de tableaux de bord par role.", "small")],
                [p("AbsenceReportController", "small"), p("Rapport d'absence par groupe pour l'administration.", "small")],
            ],
            [5 * cm, 11 * cm],
        )
    ]

    story += section("8. Regles importantes")
    story += bullets(
        [
            "Un stagiaire doit etre lie a un groupe pour voir ses matieres, cours, exercices, planning et notes.",
            "Une matiere doit etre liee a un formateur et a des groupes pour apparaitre correctement dans les espaces.",
            "Les annonces sont filtrees selon leur audience.",
            "Les creneaux horaires configures par l'administration sont utilises dans la saisie des presences.",
            "Les notes finales ne sont calculees que si CC1 et EFM sont presents.",
            "Le role de l'utilisateur determine l'acces aux ecrans et aux endpoints sensibles.",
        ]
    )

    story += section("9. Parcours utilisateur resume")
    story += [
        table(
            [
                [p("Etape", "small"), p("Description", "small")],
                [p("1. Setup", "small"), p("Creer le premier administrateur et le nom de la plateforme.", "small")],
                [p("2. Structure", "small"), p("Creer les branches et groupes.", "small")],
                [p("3. Comptes", "small"), p("Creer les formateurs et stagiaires, puis rattacher les stagiaires aux groupes.", "small")],
                [p("4. Matieres", "small"), p("Creer les matieres et les affecter aux formateurs et groupes.", "small")],
                [p("5. Planning", "small"), p("Publier les emplois du temps pour groupes et formateurs.", "small")],
                [p("6. Formation", "small"), p("Les formateurs publient cours et exercices.", "small")],
                [p("7. Suivi", "small"), p("Les formateurs saisissent presences et notes.", "small")],
                [p("8. Consultation", "small"), p("Les stagiaires consultent planning, ressources, exercices, absences et notes.", "small")],
            ],
            [4 * cm, 12 * cm],
        )
    ]

    return story


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(1.6 * cm, 1.05 * cm, "ProPath - Guide des fonctionnalites")
    canvas.drawRightString(19.4 * cm, 1.05 * cm, f"Page {doc.page}")
    canvas.restoreState()


def main():
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.6 * cm,
        title="ProPath - Guide des fonctionnalites",
        author="Codex",
    )
    doc.build(build_story(), onFirstPage=page_footer, onLaterPages=page_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
