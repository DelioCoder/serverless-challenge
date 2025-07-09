export interface StarWarsResponse {
    name:       string;
    birth_year: string;
    gender:     Gender;
    homeworld:  string;
    created:    Date;
    edited:     Date;
    url:        string;
}

export enum Gender {
    Female = "female",
    Hermaphrodite = "hermaphrodite",
    Male = "male",
    NA = "n/a",
    None = "none",
}