from marshmallow import Schema, fields

class BookCreateSchema(Schema):
    title = fields.String(required=True)
    author = fields.String(required=True)
    publishingYear = fields.Integer(required=True)

class BookUpdateSchema(Schema):
    title = fields.String()
    author = fields.String()
    publishingYear = fields.Integer()
    available = fields.Boolean()
    status = fields.String()

class BookResponseSchema(Schema):
    id = fields.Integer()
    title = fields.String()
    author = fields.String()
    publishingYear = fields.Integer()
    available = fields.Boolean()
    status = fields.String()

class BookSearchSchema(Schema):
    query = fields.String(required=True)