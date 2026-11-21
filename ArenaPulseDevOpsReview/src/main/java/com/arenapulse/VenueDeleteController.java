
package com.arenapulse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/venues")
public class VenueDeleteController {

    private final VenueRepository venueRepository;

    public VenueDeleteController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Integer id) {

        if (!venueRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        venueRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
