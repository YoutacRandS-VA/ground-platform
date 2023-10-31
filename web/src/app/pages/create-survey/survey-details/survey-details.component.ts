/**
 * Copyright 2023 The Ground Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'survey-details',
  templateUrl: './survey-details.component.html',
  styleUrls: ['./survey-details.component.scss'],
})
export class SurveyDetailsComponent {
  readonly titleControlKey = 'title';
  readonly descriptionControlKey = 'description';

  formGroup!: FormGroup;

  @Input() title = '';
  @Input() description = '';
  @Output() canContinue: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.formGroup = new FormBuilder().group({
      [this.titleControlKey]: [this.title, Validators.required],
      [this.descriptionControlKey]: this.description,
    });

    this.formGroup.statusChanges.subscribe(_ => {
      this.canContinue.emit(this.formGroup?.valid);
    });

    this.canContinue.emit(this.formGroup?.valid);
  }

  toTitleAndDescription(): [string, string] {
    return [
      this.formGroup.controls[this.titleControlKey].value,
      this.formGroup.controls[this.descriptionControlKey].value,
    ];
  }
}
