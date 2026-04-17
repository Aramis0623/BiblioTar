from marshmallow import Schema, fields
from apiflask.validators import Email

# class AddressSchema(Schema):
#     city = fields.String()
#     street = fields.String()
#     houseNumber = fields.Integer()
#     postalCode = fields.Integer()

class UserRequestSchema(Schema):
    name = fields.String(required=True)
    email = fields.String(validate=Email(), required=True)
    # password: fields.String()
    phone = fields.String(required=True)
    # address = fields.Nested(AddressSchema, required=True)
    address = fields.String(required=True)

class UserResponseSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    email = fields.String(validate=Email())
    phone = fields.String()
    # address = fields.Nested(AddressSchema)
    address = fields.String()

class UserLoginSchema(Schema):
    email = fields.String(validate=Email())
    # password: fields.String()