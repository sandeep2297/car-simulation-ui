import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SimulationService } from 'src/app/services/simulation.service';

@Component({
  selector: 'app-car-simulation-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  
  simulationForm!: FormGroup;
  showFirstMenu = true;
  showSecondMenu = false;
  addCarMenu = false;
  noCarError = false;
  xMax!: number;
  yMax!: number;
  isOptionInvalid = false;
  showGraphInfo = false;
  carDTOArray: any = [];
  isXMaxInvalid = false;
  isYMaxInvalid = false;
  isInvalidX = false;
  isInvalidY = false;
  isInvalidDirection = false;
  isInvalidCommands = false;
  numberRegex = new RegExp('^[0-9]+$');
  commandRegex = new RegExp('^[RFL]+$');
  isInvalidXInput = false;
  isInvalidYInput = false;
  showCarInfo = false;
  simulationResponse = [];
  responseError = false;
  showFinalMenu = false;
  showExitMessage = false;

  constructor(
    private formBuilder: FormBuilder,
    private simulation: SimulationService
  ) { }

  ngOnInit() {
    this.simulationForm = this.formBuilder.group({
      xMax: ['', Validators.required],
      yMax: ['', Validators.required],
      userOption: [''],
      carDTOList: this.formBuilder.array([])
    });
  }

  validateXMax(value: any) {
    this.isXMaxInvalid = !this.numberRegex.test(String(value));
    if(this.isXMaxInvalid && value !== '') {
      this.simulationForm.controls['xMax'].setErrors({});
    } else {
      this.simulationForm.controls['xMax'].setErrors(null as any);
    }
  }

  validateYMax(value: any) {
    this.isYMaxInvalid = !this.numberRegex.test(String(value));
    if(this.isYMaxInvalid && value !== '') {
      this.simulationForm.controls['yMax'].setErrors({});
    } else {
      this.simulationForm.controls['yMax'].setErrors(null as any);
    }
  }

  handleNext(value: number) {
    switch (value) {
      case 1:
        this.showFirstMenu = false;
        this.showGraphInfo = true;
        this.showSecondMenu = true;
        this.xMax = Number(this.simulationForm.controls['xMax'].value);
        this.yMax = Number(this.simulationForm.controls['yMax'].value);
        break;
      case 2:
        const carFormGroup = this.carDTOList.at(0) as FormGroup;
        const carDTO : any = {
          carName: carFormGroup.controls['carName'].value,
          currentX: carFormGroup.controls['currentX'].value,
          currentY: carFormGroup.controls['currentY'].value,
          currentDirection: carFormGroup.controls['currentDirection'].value,
          simulationCommand: carFormGroup.controls['simulationCommand'].value,
        };
        this.carDTOArray.push(carDTO);
        this.removeCarDTO();
        this.addCarMenu = false;
        this.showCarInfo = true;
        this.showSecondMenu = true;
        this.simulationForm.controls['userOption'].patchValue('');
        break;  
    }
  }

  optionInput(value: any) {
   if (value !== '' 
      && Number(value) !== 1 
      && Number(value) !== 2) {
      this.isOptionInvalid = true;
      this.simulationForm.controls['userOption'].setErrors({});
   } else {
    this.isOptionInvalid = false;
    this.simulationForm.controls['userOption'].setErrors(null as any);
   }
   this.noCarError = false;
  }

  validateXInput(value: any) {
    const carFormGroup = this.carDTOList.at(0) as FormGroup;
    if(value !== '' && !this.numberRegex.test(String(value))) {
       this.isInvalidXInput = true;
       carFormGroup.controls['currentX'].setErrors({});
    } else if(value !== '' && this.numberRegex.test(String(value)) && Number(value) > this.xMax - 1) {
      this.isInvalidX = true;
      carFormGroup.controls['currentX'].setErrors({});
    } else {
      this.isInvalidX = false;  
      this.isInvalidXInput = false;
      carFormGroup.controls['currentX'].setErrors(null as any); 
    }   
   }

   validateYInput(value: any) {
    const carFormGroup = this.carDTOList.at(0) as FormGroup;
    if(value !== '' && !this.numberRegex.test(String(value))) {
       this.isInvalidYInput = true;
       carFormGroup.controls['currentY'].setErrors({});
    } else if(value !== '' && this.numberRegex.test(String(value)) && Number(value) > this.yMax - 1) {
      this.isInvalidY = true;
      carFormGroup.controls['currentY'].setErrors({});
    } else {
      this.isInvalidY = false;
      this.isInvalidYInput = false;  
      carFormGroup.controls['currentY'].setErrors(null as any); 
    }
   }

   validateDirectionInput(value: any) {
    const carFormGroup = this.carDTOList.at(0) as FormGroup;
    if(value !== '' 
       && value !== 'N'
       && value !== 'S'
       && value !== 'E'
       && value !== 'W') {
       this.isInvalidDirection = true;
       carFormGroup.controls['currentDirection'].setErrors({});
    } else {
      this.isInvalidDirection = false;
      carFormGroup.controls['currentDirection'].setErrors(null as any);   
    }
   }

   validateSimulationCommand(value: any) {
    const carFormGroup = this.carDTOList.at(0) as FormGroup;
    this.isInvalidCommands = !this.commandRegex.test(String(value));
    if(this.isInvalidCommands && value !== '') {
      carFormGroup.controls['simulationCommand'].setErrors({});
    } else {
      carFormGroup.controls['simulationCommand'].setErrors(null as any);
    }
   }

  submitForm(submitType: number) {
    if(submitType === 1) {
      if(Number(this.simulationForm.controls['userOption'].value) === 1) {
        this.addCar();
        this.showSecondMenu = false;
        this.addCarMenu = true;
      } else {
        if (this.carDTOArray.length === 0) {
          this.noCarError = true;
        } else {
           this.showSecondMenu = false;
           this.runSimulation();
        }    
      } 
    } else {
        if(Number(this.simulationForm.controls['userOption'].value) === 1) {
            this.resetSimulation();
        } else {
          this.showFinalMenu = false;
          this.showExitMessage = true;
          this.showCarInfo = false;
          this.showGraphInfo = false;
        }
    }
    this.simulationForm.controls['userOption'].patchValue('');
    this.simulationForm.controls['userOption'].setErrors(null as any);
  }

  runSimulation() {
    const request: any = {
      xMax: this.xMax,
      yMax: this.yMax,
      carDTOList: this.carDTOArray
    };
    this.simulation.runSimulation(request).subscribe({
    next: (res) => {
       this.simulationResponse = res.data;
       this.showFinalMenu = true;
    },
    error: (err: HttpErrorResponse) => {
      this.showFinalMenu = true;
      this.responseError = true;
      console.error("Error Occurred: ", err);
    } 
  });
  }

  resetSimulation() {
    this.showFirstMenu = true;
    this.showSecondMenu = false;
    this.addCarMenu = false;
    this.noCarError = false;
    this.isOptionInvalid = false;
    this.showGraphInfo = false;
    this.carDTOArray = [];
    this.isXMaxInvalid = false;
    this.isYMaxInvalid = false;
    this.isInvalidX = false;
    this.isInvalidY = false;
    this.isInvalidDirection = false;
    this.isInvalidCommands = false;
    this.isInvalidXInput = false;
    this.isInvalidYInput = false;
    this.showCarInfo = false;
    this.simulationResponse = [];
    this.responseError = false;
    this.showFinalMenu = false;
    this.showExitMessage = false;
    this.simulationForm.reset();
  }

  addCar() {
    const carDTO = this.formBuilder.group({
      carName: ['', Validators.required],
      currentX: ['', Validators.required],
      currentY: ['', Validators.required],
      currentDirection: ['', Validators.required],
      simulationCommand: ['', Validators.required]
    });
    this.carDTOList.push(carDTO);
  }

  get carDTOList() {
    return this.simulationForm.get('carDTOList') as FormArray;
  }

  removeCarDTO() {
    this.carDTOList.removeAt(0);
  }

}
