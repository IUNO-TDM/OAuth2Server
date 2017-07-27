# Roles, Scopes and Permissions

This file describes the existing roles, scopes and permissions in the marketplace.

**Roles**

     > a Role defines which data an user is allowed to access

     > a User may have one or more roles

| Role                  | Description                                                                                                                            |
------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Public                | Everyone that visit the marketplace without login. The public role Is only allowed to read a pre defined area (e.g. Landing Page).     |
| MachineOperator       | It can be the machine owner as well as the machine operator.                                                                           |
| TechnologyDataOwner   | Is the creator and administrator of Technology Data                                                                                    |                                                 |
| MarketplaceComponent  | Marketplace components may be services (e.g. Web Service) using the marketplace core or other marketplace interfaces.                  |
| Admin                 | Is the main marketplace admin.                                                                                                         |
| TechnologyAdmin       | Administrate technologies.                                                                                                             |

**Scopes**

    > a scope defines which data a token owner is allowed to access

**Clients**

    > a client are only able to call some pre defined scopes

**Permissions**

| Role                 | Create | Update | Read | Delete | Data              | All | Own |
|----------------------|--------|--------|------|--------|-------------------|-----|-----|
| Public               |        |        | x    |        | public reports    | x   |     |
| Public               |        |        | x    |        | TechnologyData    | x   |     |
| Public               |        |        | x    |        | Components        | x   |     |
| MachineOperator      |        |        | x    |        | TechnologyData    | x   |     |
| MachineOperator      | x      |        |      |        | OfferRequest      |     |     |
| MachineOperator      |        |        | x    |        | License Updates   |     |     |
| MachineOperator      |        |        | x    |        | Users             | x   |     |
| MachineOperator      |        |        | x    |        | Components        | x   |     |
| MachineOperator      |        |        | x    |        | Offer             |     | x   |
| MachineOperator      | x      |        | x    | x      | Machine           |     | x   |
| TechnologyDataOwner  | x      |        | x    |        | TechnologyData    | x   |     |
| TechnologyDataOwner  |        |        | x    |        | Users             | x   |     |
| TechnologyDataOwner  | x      |        | x    |        | Components        | x   |     |
| TechnologyDataOwner  |        |        | x    |        | Private Reports   |     | x   |
| TechnologyDataOwner  |        |        | x    |        | Credit            |     | x   |
| TechnologyDataOwner  | x      |        |      |        | Payout            |     |     |
| TechnologyDataOwner  |        | x      | x    |        | Private User Data |     | x   |
| MarketplaceComponent |        |        | x    |        | TokenInfo         | x   |     |
| MarketplaceComponent | x      |        |      |        | Users             |     |     |
| Admin                |        | x      |      |        | Role              | x   |     |
| Admin                |        |        |      | x      | Users             | x   |     |
| Admin                |        |        | x    |        | Machine           | x   |     |
| Admin                |        |        | x    |        | Private User Data | x   |     |
| TechnologyAdmin      | x      |        |      |        | Technology        |     |     |
| TechnologyAdmin      |        |        |      | x      | TechnologyData    | x   |     |
| TechnologyAdmin      |        | x      |      | x      | Components        | x   |     |