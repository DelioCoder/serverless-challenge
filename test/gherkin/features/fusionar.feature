Feature: Fusionar personajes y pokémon

  Scenario: Usuario autenticado fusiona datos exitosamente
    Given que el usuario tiene un token JWT válido
    When realiza una petición GET al endpoint "/fusionar"
    Then la respuesta debe tener código de estado 200
    And el cuerpo debe contener "newStarWarCharacters"

  Scenario: Usuario no autenticado intenta fusionar
    Given que el usuario no tiene un token JWT
    When realiza una petición GET al endpoint "/fusionar"
    Then la respuesta debe tener código de estado 401
