from marshmallow import Schema, fields, validate


class BorrowCreateSchema(Schema):
    user_id = fields.Integer(required=True)
    book_id = fields.Integer(required=True)
    daysBorrowed = fields.Integer(load_default=14, validate=validate.Range(min=1))


class BorrowReturnSchema(Schema):
    fine = fields.Integer(load_default=0, validate=validate.Range(min=0))


class BorrowExtendSchema(Schema):
    days = fields.Integer(load_default=7, validate=validate.Range(min=1))


class FineCreateSchema(Schema):
    fine = fields.Integer(required=True, validate=validate.Range(min=0))
    reason = fields.String(load_default="")


class BorrowedBookResponseSchema(Schema):
    id = fields.Integer()
    user_id = fields.Integer()
    user_name = fields.String()
    book_id = fields.Integer()
    book_title = fields.String()
    status = fields.String()
    dateBorrowed = fields.String(allow_none=True)
    daysBorrowed = fields.Integer()
    dueDate = fields.String(allow_none=True)
    extend_count = fields.Integer()
    fine = fields.Integer()


class BookSearchSchema(Schema):
    query = fields.String(required=True)


class BorrowSearchSchema(Schema):
    query = fields.String(required=True)
