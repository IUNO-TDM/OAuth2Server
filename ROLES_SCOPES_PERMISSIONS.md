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