from marshmallow import Schema, fields, validate
from apiflask.validators import Email



class UserRequestSchema(Schema):
    name = fields.String(required=True)
    email = fields.String(required=True, validate=Email())
    password = fields.String(required=True)
    phone = fields.String(required=True)
    address = fields.String(required=True)



class UserLoginSchema(Schema):
    email = fields.String(required=True, validate=Email())
    password = fields.String(required=True)



class UserResponseSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    email = fields.String()
    phone = fields.String()
    address = fields.String()



class UserUpdateSchema(Schema):
    phone = fields.String(required=False)
    address = fields.String(required=False)

class BookSearchSchema(Schema):
    query = fields.String(required=True)

class BorrowExtendSchema(Schema):
    days = fields.Integer(load_default=7, validate=validate.Range(min=1))

class BorrowedBookResponseSchema(Schema):
    id = fields.Integer()
    user_name = fields.String()
    book_id = fields.Integer()
    book_title = fields.String()
    status = fields.String()
    dateBorrowed = fields.String(allow_none=True)
    daysBorrowed = fields.Integer()
    dueDate = fields.String(allow_none=True)
    extend_count = fields.Integer()