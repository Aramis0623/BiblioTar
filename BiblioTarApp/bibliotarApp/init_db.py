from app import create_app
from app.extensions import db
from app.models import User, Role, Book

app = create_app()

with app.app_context():
    
    db.drop_all()
    db.create_all()

    
    admin_role = Role(name="admin")
    librarian_role = Role(name="librarian")
    user_role = Role(name="user")
    db.session.add_all([admin_role, librarian_role, user_role])
    db.session.commit()

    
    admin_user = User(
        name="Admin User",
        email="admin@bibliotar.com",
        phone="123456789",
        address="123 Admin St."
    )
    admin_user.set_password("adminpass")
    admin_user.roles.append(admin_role)

    librarian_user = User(
        name="Könyvtáros Károly",
        email="librarian@bibliotar.com",
        phone="111222333",
        address="789 Könyvtár utca"
    )
    librarian_user.set_password("librarianpass")
    librarian_user.roles.append(librarian_role)

    regular_user = User(
        name="Teszt Elek",
        email="teszt@user.com",
        phone="987654321",
        address="456 Teszt utca"
    )
    regular_user.set_password("tesztpass")
    regular_user.roles.append(user_role)

    db.session.add_all([admin_user, librarian_user, regular_user])
    db.session.commit()


    book1 = Book(
        title="A Gyűrűk Ura",
        author="J.R.R. Tolkien",
        publishingYear=1954,
        available=True,
        status="available"
    )
    book2 = Book(
        title="Harry Potter",
        author="J.K. Rowling",
        publishingYear=1997,
        available=True,
        status="available"
    )
    book3 = Book(
        title="1984",
        author="George Orwell",
        publishingYear=1949,
        available=True,
        status="available"
    )
    book4 = Book(
        title="A Mester és Margarita",
        author="Mihail Bulgakov",
        publishingYear=1967,
        available=True,
        status="available"
    )
    book5= Book(
        title="Felelős Alkoholista",
        author="Bálint Ferenc",
        publishingYear=2023,
        available=True,
        status="available"
    )


    db.session.add_all([book1, book2, book3, book4, book5])
    db.session.commit()

    from app.models.borrowedBook import BorrowedBook, StatusEnum
    from app.models.reservation import Reservation
    from datetime import date, timedelta

    #aktív kölcsönzés 
    book3.available = False
    book3.status = "borrowed"
    book3.dateBorrowed = date.today() - timedelta(days=11)
    book3.daysBorrowed = 14 
    
    borrow1 = BorrowedBook(user=regular_user, book=book3, status=StatusEnum.ACTIVE)

    #lejárt kölcsönzés
    book4.available = False
    book4.status = "borrowed"
    book4.dateBorrowed = date.today() - timedelta(days=20)
    book4.daysBorrowed = 14 
    
    borrow2 = BorrowedBook(user=regular_user, book=book4, status=StatusEnum.PASTDUE)

    #foglalás
    book2.available = False
    book2.status = "reserved"
    res1 = Reservation(user=regular_user, book=book2)


    book6 = Book(title="Budapesti Patkányok A Világ Körül", author="Ádám Gábor", publishingYear=2024, available=True, status="available")
    book7 = Book(title="Hogyan Öregedjünk Méltóságmentesen?", author="Clare Pooley", publishingYear=2021, available=False, status="damaged")

    db.session.add_all([book6, book7])
    db.session.commit()

    borrow3 = BorrowedBook(user=regular_user, book=book7, status=StatusEnum.PASTDUE)


    db.session.add_all([borrow1, borrow2, res1])
    db.session.commit()

    
    
    print("Az adatbázis sikeresen inicializálva tesztadatokkal!")
