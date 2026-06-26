import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { faker } from '@faker-js/faker';

// Ejemplo 2 de 5.19a (Virtual Scroll "entretenido"): lista de 10.000 usuarios
// generados con faker, renderizados con virtual scroll y animación lightSpeedIn.
@Component({
  selector: 'app-user',
  imports: [ScrollingModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  // Generamos 10.000 usuarios falsos para apreciar la ventaja del virtual scroll.
  data = Array(10000)
    .fill(1)
    .map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
    }));
}
